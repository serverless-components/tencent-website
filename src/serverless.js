const { Component } = require('@serverless/core')
const path = require('path')
const fs = require('fs')
const request = require('request')
const stringRandom = require('string-random')
const { Cos, Cdn } = require('tencent-component-toolkit')
const CONFIGS = require('./config')

class ServerlessComponent extends Component {
  getCredentials() {
    const { tmpSecrets } = this.credentials.tencent

    if (!tmpSecrets || !tmpSecrets.TmpSecretId) {
      throw new Error(
        'Cannot get secretId/Key, your account could be sub-account or does not have access, please check if SLS_QcsRole role exists in your account, and visit https://console.cloud.tencent.com/cam to bind this role to your account.'
      )
    }

    return {
      SecretId: tmpSecrets.TmpSecretId,
      SecretKey: tmpSecrets.TmpSecretKey,
      Token: tmpSecrets.Token
    }
  }

  getDefaultProtocol(protocols) {
    if (String(protocols).includes('https')) {
      return 'https'
    }
    return 'http'
  }

  async downloadDefaultZip() {
    const scfUrl = CONFIGS.templateUrl
    const loacalPath = '/tmp/' + stringRandom(10)
    fs.mkdirSync(loacalPath)
    return new Promise(function(resolve, reject) {
      request(scfUrl, function(error, response) {
        if (!error && response.statusCode == 200) {
          const stream = fs.createWriteStream(path.join(loacalPath, 'demo.zip'))
          request(scfUrl)
            .pipe(stream)
            .on('close', function() {
              resolve(path.join(loacalPath, 'demo.zip'))
            })
        } else {
          if (error) {
            reject(error)
          } else {
            reject(new Error(`Download error, status code: ${response.statusCode}`))
          }
        }
      })
    })
  }

  async deployCdn({ credentials, domains = [], cosOrigin, originPullProtocol }) {
    console.log(`Deploying CDN ...`)
    let tencentCdnOutput
    let protocol
    let cdnInputs
    const cdnResult = []
    const outputs = []
    const cdn = new Cdn(credentials)
    for (let i = 0; i < domains.length; i++) {
      cdnInputs = domains[i]
      cdnInputs.domain = cdnInputs.host
      cdnInputs.serviceType = 'web'
      cdnInputs.origin = {
        origins: [cosOrigin],
        originType: 'cos',
        originPullProtocol: originPullProtocol
      }

      if (cdnInputs.autoRefesh) {
        cdnInputs.refreshCdn = {
          urls: [`http://${cdnInputs.domain}`, `https://${cdnInputs.domain}`]
        }
      }
      tencentCdnOutput = await cdn.deploy(cdnInputs)
      protocol = tencentCdnOutput.https ? 'https' : 'http'
      cdnResult.push(
        protocol + '://' + tencentCdnOutput.domain + ' (CNAME: ' + tencentCdnOutput.cname + '）'
      )
      outputs.push(tencentCdnOutput)
    }
    return {
      outputs,
      cdnResult
    }
  }

  async deploy(inputs) {
    console.log(`Deploying Tencent Website ...`)

    const credentials = this.getCredentials()
    const appid = this.credentials.tencent.tmpSecrets.appId

    // 默认值
    const region = inputs.region || CONFIGS.region
    const output = {
      region
    }

    // 判断是否需要测试模板
    if (!inputs.srcOriginal) {
      output.templateUrl = CONFIGS.templateUrl
      inputs.srcOriginal = inputs.src || {}
      inputs.src = await this.downloadDefaultZip()
      inputs.srcOriginal.websitePath = './src'
    }

    const sourceDirectory = await this.unzip(inputs.src)

    // 创建cos对象
    const cos = new Cos(credentials, region)

    // 标准化website inputs
    const websiteInputs = {
      code: {
        src: inputs.srcOriginal.websitePath
          ? path.join(sourceDirectory, inputs.srcOriginal.websitePath)
          : sourceDirectory,
        index: inputs.srcOriginal.index || CONFIGS.indexPage,
        error: inputs.srcOriginal.error || CONFIGS.errorPage
      },
      bucket: inputs.bucketName + '-' + appid,
      region,
      protocol: inputs.protocol || CONFIGS.protocol
    }
    if (inputs.env) {
      websiteInputs.env = inputs.env
    }
    if (inputs.srcOriginal.envPath) {
      websiteInputs.code.envPath = path.join(websiteInputs.code.src, inputs.srcOriginal.envPath)
    }
    if (inputs.cors) {
      websiteInputs.cors = inputs.cors
    }

    console.log(`Deploying Website ...`)

    // 部署网站
    const websiteUrl = await cos.website(websiteInputs)

    output.website = this.getDefaultProtocol(websiteInputs.protocol) + '://' + websiteUrl
    this.state = {
      region,
      website: websiteInputs
    }

    const cosOriginAdd = `${websiteInputs.bucket}.cos-website.${websiteInputs.region}.myqcloud.com`
    if (inputs.hosts && inputs.hosts.length > 0) {
      const deployCdnRes = await this.deployCdn({
        credentials,
        domains: inputs.hosts,
        cosOrigin: cosOriginAdd,
        originPullProtocol: websiteInputs.protocol
      })

      output.hosts = deployCdnRes.cdnResult
      this.state.cdn = deployCdnRes.outputs
    }

    await this.save()
    console.log(`Deployed Tencent Website.`)

    return output
  }

  // eslint-disable-next-line
  async remove(inputs = {}) {
    console.log(`Removing Webiste ...`)

    const credentials = this.getCredentials()

    // 默认值
    const { region } = this.state

    // 创建cos对象
    const cos = new Cos(credentials, region)
    await cos.remove(this.state.website)

    if (this.state.cdn) {
      const cdn = new Cdn(credentials, region)
      for (let i = 0; i < this.state.cdn.length; i++) {
        await cdn.remove(this.state.cdn[i])
      }
    }

    this.state = {}
    console.log(`Removed Website`)
  }
}

module.exports = ServerlessComponent
