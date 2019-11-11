const COS = require('cos-nodejs-sdk-v5')
const path = require('path')
const util = require('util')
const fs = require('fs')
const exec = util.promisify(require('child_process').exec)
const { Component, utils } = require('@serverless/core')
const { configureBucketForHosting } = require('./utils')
const tencentcloud = require('tencentcloud-sdk-nodejs')
const ClientProfile = require('tencentcloud-sdk-nodejs/tencentcloud/common/profile/client_profile.js')
const HttpProfile = require('tencentcloud-sdk-nodejs/tencentcloud/common/profile/http_profile.js')
const AbstractModel = require('tencentcloud-sdk-nodejs/tencentcloud/common/abstract_model')
const AbstractClient = require('tencentcloud-sdk-nodejs/tencentcloud/common/abstract_client')

class GetUserAppIdResponse extends AbstractModel {
  constructor() {
    super()

    this.RequestId = null
  }

  deserialize(params) {
    if (!params) {
      return
    }
    this.AppId = 'RequestId' in params ? params.AppId : null
    this.RequestId = 'RequestId' in params ? params.RequestId : null
  }
}

class AppidClient extends AbstractClient {
  constructor(credential, region, profile) {
    super('cam.tencentcloudapi.com', '2019-01-16', credential, region, profile)
  }

  GetUserAppId(req, cb) {
    const resp = new GetUserAppIdResponse()
    this.request('GetUserAppId', req, resp, cb)
  }
}

class Website extends Component {
  confirmEnding(sourceStr, targetStr) {
    // judge the sourceStr end with targetStr
    targetStr = targetStr.toString()
    const start = sourceStr.length - targetStr.length
    const arr = sourceStr.substr(start, targetStr.length)
    if (arr == targetStr) {
      return true
    }
    return false
  }

  getAppid(credentials) {
    const secret_id = credentials.SecretId
    const secret_key = credentials.SecretKey
    const cred = new tencentcloud.common.Credential(secret_id, secret_key)
    const httpProfile = new HttpProfile()
    httpProfile.reqTimeout = 30
    const clientProfile = new ClientProfile('HmacSHA256', httpProfile)
    const cam = new AppidClient(cred, 'ap-guangzhou', clientProfile)
    const req = new GetUserAppIdResponse()
    const body = {}
    req.from_json_string(JSON.stringify(body))
    const handler = util.promisify(cam.GetUserAppId.bind(cam))
    try {
      return handler(req)
    } catch (e) {
      throw 'Get Appid failed! '
    }
  }

  async default(inputs = {}) {
    this.context.status('Deploying')
    this.context.debug(`Starting Website Component.`)

    // Default to current working directory
    const appId = await this.getAppid(this.context.credentials.tencent)
    this.context.credentials.tencent.AppId = appId.AppId
    inputs.code = inputs.code || {}
    inputs.code.root = inputs.code.root ? path.resolve(inputs.code.root) : process.cwd()
    inputs.code.index = inputs.code.index || 'index.html'
    inputs.code.error = inputs.code.error || 'error.html'
    if (inputs.code.src) {
      inputs.code.src = path.join(inputs.code.root, inputs.code.src)
    }
    inputs.region = inputs.region || 'ap-guangzhou'
    inputs.bucketName = this.state.bucketName || inputs.bucketName || this.context.resourceId()
    if (!this.confirmEnding(inputs.bucketName, this.context.credentials.tencent.AppId)) {
      inputs.bucketName = inputs.bucketName + '-' + this.context.credentials.tencent.AppId
    }

    this.context.status(`Preparing Tencent COS Bucket`)
    this.context.debug(`Preparing website Tencent COS bucket ${inputs.bucketName}.`)

    const websiteBucket = await this.load('@serverless/tencent-cos', 'websiteBucket')
    await websiteBucket({
      bucket: inputs.bucketName,
      region: inputs.region
    })
    this.state.bucketName = inputs.bucketName
    await this.save()

    const cos = new COS({
      SecretId: this.context.credentials.tencent.SecretId,
      SecretKey: this.context.credentials.tencent.SecretKey,
      UserAgent: 'ServerlessComponent'
    })

    this.context.debug(`Configuring bucket ${inputs.bucketName} for website hosting.`)
    await configureBucketForHosting(
      cos,
      inputs.bucketName,
      this.context.credentials.tencent.AppId,
      inputs.region,
      inputs.code.index,
      inputs.code.error,
      inputs.cors || null
    )

    // Build environment variables
    if (inputs.env && Object.keys(inputs.env).length && inputs.code.root) {
      this.context.status(`Bundling environment variables`)
      this.context.debug(`Bundling website environment variables.`)
      let script = 'window.env = {};\n'
      inputs.env = inputs.env || {}
      for (const e in inputs.env) {
				// eslint-disable-line
				script += `window.env.${e} = ${JSON.stringify(inputs.env[e])};\n` // eslint-disable-line
      }
      const envFilePath = path.join(inputs.code.root, 'env.js')
      await utils.writeFile(envFilePath, script)
      this.context.debug(`Website env written to file ${envFilePath}.`)
    }

    // If a hook is provided, build the website
    if (inputs.code.hook) {
      this.context.status('Building assets')
      this.context.debug(`Running ${inputs.code.hook} in ${inputs.code.root}.`)

      const options = { cwd: inputs.code.root }
      try {
        await exec(inputs.code.hook, options)
      } catch (err) {
				console.error(err.stderr) // eslint-disable-line
        throw new Error(
          `Failed building website via "${inputs.code.hook}" due to the following error: "${err.stderr}"`
        )
      }
    }

    this.context.status('Uploading')

    const dirToUploadPath = inputs.code.src || inputs.code.root

    this.context.debug(
      `Uploading website files from ${dirToUploadPath} to bucket ${inputs.bucketName}.`
    )

    if (fs.lstatSync(dirToUploadPath).isDirectory()) {
      await websiteBucket.upload({ dir: dirToUploadPath })
    } else {
      await websiteBucket.upload({ file: dirToUploadPath })
    }

    this.state.bucketName = inputs.bucketName
    this.state.region = inputs.region
    this.state.url = `https://${inputs.bucketName}.cos-website.${inputs.region}.myqcloud.com`
    await this.save()

    const outputs = {
      url: this.state.url,
      env: inputs.env || {}
    }

    this.context.debug(`Website deployed successfully to URL: ${this.state.url}.`)

    return outputs
  }

  /**
   * Remove
   */

  async remove() {
    this.context.status(`Removing`)

    this.context.debug(`Starting Website Removal.`)

    this.context.debug(`Removing Website bucket.`)
    const websiteBucket = await this.load('@serverless/tencent-cos', 'websiteBucket')
    await websiteBucket.remove()

    this.state = {}
    await this.save()

    this.context.debug(`Finished Website Removal.`)
    return {}
  }
}

module.exports = Website
