const CONFIGS = {
  templateUrl:
    'https://serverless-templates-1300862921.cos.ap-beijing.myqcloud.com/website-demo.zip',
  region: 'ap-guangzhou',
  compName: 'website',
  compFullname: 'Website',
  indexPage: 'index.html',
  errorPage: 'error.html',
  protocol: 'https',
  description: 'Created by Serverless Component',
  acl: {
    permissions: 'public-read',
    grantRead: '',
    grantWrite: '',
    grantFullControl: ''
  },
  getPolicy(region, bucket, appid) {
    return {
      Statement: [
        {
          Principal: { qcs: ['qcs::cam::anyone:anyone'] },
          Effect: 'Allow',
          Action: [
            'name/cos:HeadBucket',
            'name/cos:ListMultipartUploads',
            'name/cos:ListParts',
            'name/cos:GetObject',
            'name/cos:HeadObject',
            'name/cos:OptionsObject'
          ],
          Resource: [`qcs::cos:${region}:uid/${appid}:${bucket}-${appid}/*`]
        }
      ],
      version: '2.0'
    }
  }
}

module.exports = CONFIGS
