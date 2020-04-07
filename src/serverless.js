const {Component} = require('@serverless/core')
const path = require('path')
const fs = require('fs')
const ensureString = require('type/string/ensure')
const Cam = require('tencent-cloud-sdk').cam
const {Cos, Cdn} = require('tencent-component-toolkit')

class Express extends Component {
  async getUserInfo(credentials) {
    const cam = new Cam(credentials)
    return await cam.request({
      Action: 'GetUserAppId',
      Version: '2019-01-16'
    })
  }

  getDefaultProtocol(protocols) {
    if (String(protocols).includes('https')) {
      return 'https'
    }
    return 'http'
  }

  async deploy(inputs) {
    console.log(`Deploying Tencent Website ...`)

    // 获取腾讯云密钥信息
    const credentials = this.credentials.tencent

    // 默认值
    const region = inputs.region || "ap-guangzhou"
    const userInfo = await this.getUserInfo(credentials)

    const sourceDirectory = await this.unzip(inputs.src)

    // 创建cos对象
    const cos = new Cos(credentials, region)

    // 标准化website inputs
    const websiteInputs = {
      code: {
        src: inputs.src.websitePath ? path.join(sourceDirectory, inputs.src.websitePath) : sourceDirectory,
        index: inputs.src.index || 'index.html',
        error: inputs.src.error || 'error.html',
      },
      bucket: inputs.bucketName,
      region: inputs.region || 'ap-guangzhou',
      protocol: inputs.protocol || 'http',
      appid: userInfo.Response.AppId
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
    const cosOriginAdd = `${websiteInputs.bucket}-${userInfo.Response.AppId}.cos-website.${websiteInputs.region}.myqcloud.com`
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
        console.log(cdnInputs)
        tencentCdnOutput = await cdn.deploy(cdnInputs)
        protocol = tencentCdnOutput.https ? 'https' : 'http'
        cdnResult.push(protocol + '://' + tencentCdnOutput.host + ' (CNAME: ' + tencentCdnOutput.cname + '）')
        cdnState.push(tencentCdnOutput)
      }
    }

    this.state = {
      website: websiteInputs,
      cdn: cdnState
    }

    await this.save()
    console.log(`Deployed Tencent Website.`)
    return {"website": this.getDefaultProtocol(websiteInputs.protocol) + "://" + websiteUrl, "host": cdnResult}


  }

  async remove(inputs = {}) {
    console.log(`Removing Tencent Webiste ...`)

    // 获取腾讯云密钥信息
    const credentials = this.credentials.tencent

    // 默认值
    const region = inputs.region || "ap-guangzhou"
    const userInfo = await this.getUserInfo(credentials)

    // 创建cos对象
    const cos = new Cos(credentials, region)
    await cos.remove(this.state.website)

    if(this.state.cdn){
      const cdn = new Cdn(credentials, region)
      for(let i=0;i<this.state.cdn.length;i++){
        await cdn.remove(this.state.cdn[i])
      }
    }

    this.state = {}
    console.log(`Removed Tencent Website`)
  }
}

module.exports = Express
