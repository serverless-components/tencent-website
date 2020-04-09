const { Component } = require('@serverless/core')
const path = require('path')
const fs = require('fs')
const request = require('request')
const stringRandom = require('string-random')
const { Cos, Cdn } = require('tencent-component-toolkit')

const templateDownloadUrl =
  'https://serverless-templates-1300862921.cos.ap-beijing.myqcloud.com/website-demo.zip'

class Express extends Component {
  getDefaultProtocol(protocols) {
    if (String(protocols).includes('https')) {
      return 'https'
    }
    return 'http'
  }

  async downloadDefaultZip() {
    const scfUrl = templateDownloadUrl
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
            reject(new Error('下载失败，返回状态码不是200，状态码：' + response.statusCode))
          }
        }
      })
    })
  }

  async deploy(inputs) {
    console.log(`Deploying Tencent Website ...`)

    // 获取腾讯云密钥信息
    if (!this.credentials.tencent.tmpSecrets) {
      throw new Error('Please add SLS_QcsRole in your tencent account.')
    }
    const credentials = {
      SecretId: this.credentials.tencent.tmpSecrets.TmpSecretId,
      SecretKey: this.credentials.tencent.tmpSecrets.TmpSecretKey,
      Token: this.credentials.tencent.tmpSecrets.Token
    }
    const appid = this.credentials.tencent.tmpSecrets.appId

    // 默认值
    const region = inputs.region || 'ap-guangzhou'
    const output = {}

    // 判断是否需要测试模板
    if (!inputs.srcOriginal) {
      output.templateUrl = templateDownloadUrl
      inputs.srcOriginal = inputs.src
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
        index: inputs.srcOriginal.index || 'index.html',
        error: inputs.srcOriginal.error || 'error.html'
      },
      bucket: inputs.bucketName + '-' + appid,
      region: inputs.region || 'ap-guangzhou',
      protocol: inputs.protocol || 'http'
    }
    if (inputs.env) {
      websiteInputs.env = inputs.env
    }
    if (inputs.envPath) {
      websiteInputs.envPath = inputs.envPath
    }
    if (inputs.cors) {
      websiteInputs.cors = inputs.cors
    }

    console.log(`Deploying Website ...`)

    // 部署网站
    const websiteUrl = await cos.website(websiteInputs)

    // 部署CDN
    const cdnResult = []
    const cdnState = []
    const cosOriginAdd = `${websiteInputs.bucket}.cos-website.${websiteInputs.region}.myqcloud.com`
    if (inputs.hosts && inputs.hosts.length > 0) {
      console.log(`Deploying CDN ...`)
      let tencentCdnOutput
      let protocol
      let cdnInputs
      const cdn = new Cdn(credentials, region)
      for (let i = 0; i < inputs.hosts.length; i++) {
        cdnInputs = inputs.hosts[i]
        cdnInputs.hostType = 'cos'
        cdnInputs.serviceType = 'web'
        cdnInputs.fwdHost = cosOriginAdd
        cdnInputs.origin = cosOriginAdd
        tencentCdnOutput = await cdn.deploy(cdnInputs)
        protocol = tencentCdnOutput.https ? 'https' : 'http'
        cdnResult.push(
          protocol + '://' + tencentCdnOutput.host + ' (CNAME: ' + tencentCdnOutput.cname + '）'
        )
        cdnState.push(tencentCdnOutput)
      }
    }

    this.state = {
      website: websiteInputs,
      cdn: cdnState
    }

    await this.save()
    console.log(`Deployed Tencent Website.`)

    output.website = this.getDefaultProtocol(websiteInputs.protocol) + '://' + websiteUrl
    if (cdnResult.length > 0) {
      output.host = cdnResult
    }

    return output
  }

  async remove(inputs = {}) {
    console.log(`Removing Tencent Webiste ...`)

    // 获取腾讯云密钥信息
    if (!this.credentials.tencent.tmpSecrets) {
      throw new Error('Please add SLS_QcsRole in your tencent account.')
    }
    const credentials = {
      SecretId: this.credentials.tencent.tmpSecrets.TmpSecretId,
      SecretKey: this.credentials.tencent.tmpSecrets.TmpSecretKey,
      Token: this.credentials.tencent.tmpSecrets.Token
    }

    // 默认值
    const region = inputs.region || 'ap-guangzhou'

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
    console.log(`Removed Tencent Website`)
  }
}

module.exports = Express
