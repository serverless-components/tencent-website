const { Component } = require('@serverless/core')
const { Cos, Cdn } = require('tencent-component-toolkit')
const { ApiTypeError } = require('tencent-component-toolkit/lib/utils/error')
const CONFIGS = require('./config')
const { prepareInputs } = require('./utils')

class ServerlessComponent extends Component {
  getCredentials() {
    const { tmpSecrets } = this.credentials.tencent

    if (!tmpSecrets || !tmpSecrets.TmpSecretId) {
      throw new ApiTypeError(
        'CREDENTIAL',
        'Cannot get secretId/Key, your account could be sub-account and does not have the access to use SLS_QcsRole, please make sure the role exists first, then visit https://cloud.tencent.com/document/product/1154/43006, follow the instructions to bind the role to your account.'
      )
    }

    return {
      SecretId: tmpSecrets.TmpSecretId,
      SecretKey: tmpSecrets.TmpSecretKey,
      Token: tmpSecrets.Token
    }
  }

  getAppId() {
    return this.credentials.tencent.tmpSecrets.appId
  }

  getDefaultProtocol(protocols) {
    if (String(protocols).includes('https')) {
      return 'https'
    }
    return 'http'
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

      if (cdnInputs.autoRefresh) {
        cdnInputs.refreshCdn = {
          urls: [`http://${cdnInputs.domain}`, `https://${cdnInputs.domain}`]
        }
      }
      tencentCdnOutput = await cdn.deploy(cdnInputs)
      protocol = tencentCdnOutput.https ? 'https' : 'http'
      const result = {
        domain: `${protocol}://${tencentCdnOutput.domain}`,
        cname: tencentCdnOutput.cname
      }
      if (cdnInputs.onlyRefresh !== true) {
        if (cdnInputs.refreshCdn && cdnInputs.refreshCdn.urls) {
          result.refreshUrls = cdnInputs.refreshCdn.urls
        }
        cdnResult.push(result)
      }
      outputs.push(tencentCdnOutput)
    }
    return {
      outputs,
      cdnResult
    }
  }

  async deploy(inputs) {
    console.log(`Deploying Tencent ${CONFIGS.compFullname}`)

    const credentials = this.getCredentials()

    // 标准化website inputs
    const websiteInputs = await prepareInputs(this, inputs)

    const { region } = websiteInputs

    const output = {
      region
    }
    this.state = {
      region,
      bucket: websiteInputs.bucket,
      website: websiteInputs
    }

    if (websiteInputs.useDefault) {
      output.templateUrl = CONFIGS.templateUrl
    }

    inputs.srcOriginal = inputs.srcOriginal || {}

    const cos = new Cos(credentials, region)
    const websiteUrl = await cos.website(websiteInputs)

    output.website = this.getDefaultProtocol(websiteInputs.protocol) + '://' + websiteUrl

    const cosOriginAdd = `${websiteInputs.bucket}.cos-website.${websiteInputs.region}.myqcloud.com`
    if (inputs.hosts && inputs.hosts.length > 0) {
      const deployCdnRes = await this.deployCdn({
        credentials,
        domains: inputs.hosts,
        cosOrigin: cosOriginAdd,
        originPullProtocol: websiteInputs.protocol
      })

      this.state.cdn = deployCdnRes.outputs
      output.cdnDomains = deployCdnRes.cdnResult
    }

    await this.save()
    console.log(`Deployed Tencent ${CONFIGS.compFullname} success`)

    return output
  }

  // eslint-disable-next-line
  async remove(inputs = {}) {
    console.log(`Removing ${CONFIGS.compFullname}`)

    const credentials = this.getCredentials()

    // 默认值
    const { region } = this.state

    const cos = new Cos(credentials, region)
    await cos.remove(this.state.website)

    const stateCdn = this.state.cdn
    if (stateCdn) {
      const cdn = new Cdn(credentials, region)
      for (let i = 0; i < stateCdn.length; i++) {
        const curCdnConf = stateCdn[i]
        if (curCdnConf.created === true) {
          await cdn.remove(curCdnConf)
        }
      }
    }

    this.state = {}
    console.log(`Removed ${CONFIGS.compFullname}`)
  }
}

module.exports = ServerlessComponent
