const util = require('util')
const { utils } = require('@serverless/core')

const configureBucketForHosting = async (
  cos,
  bucketName,
  appid,
  region,
  index,
  error,
  cors,
  protocol
) => {
  let handler

  // const cosBucketPolicy = {
  //   version: '2.0',
  //   Statement: [
  //     {
  //       Effect: 'Deny',
  //       Action: ['name/cos:GetBucket', 'name/cos:GetBucketObjectVersions'],
  //       Principal: { qcs: ['qcs::cam::anyone:anyone'] },
  //       Resource: [`qcs::cos:${region}:uid/${appid}:${bucketName}/*`]
  //     }
  //   ]
  // }

  const staticHostParams = {
    Bucket: bucketName,
    Region: region,
    WebsiteConfiguration: {
      IndexDocument: {
        Suffix: index || 'index.html'
      },
      ErrorDocument: {
        Key: error || 'error.html'
      },
      RedirectAllRequestsTo: {
        Protocol: protocol || 'https'
      }
    }
  }

  try {
    if (cors && cors.length > 0) {
      const corsArray = new Array()
      for (let i = 0; i < cors.length; i++) {
        corsArray.push({
          AllowedMethods: cors[i].allowedMethods,
          AllowedOrigins: cors[i].allowedOrigins,
          AllowedHeaders: cors[i].allowedHeaders,
          MaxAgeSeconds: cors[i].maxAgeSeconds
        })
      }
      handler = util.promisify(cos.putBucketCors.bind(cos))
      try {
        await handler({
          Bucket: bucketName,
          CORSRules: corsArray,
          Region: region
        })
      } catch (e) {
        throw e
      }
    }

    // handler = util.promisify(cos.putBucketPolicy.bind(cos))
    // try {
    //   await handler({
    //     Bucket: bucketName,
    //     Policy: JSON.stringify(cosBucketPolicy),
    //     Region: region
    //   })
    // } catch (e) {
    //   throw e
    // }

    handler = util.promisify(cos.putBucketWebsite.bind(cos))
    try {
      await handler(staticHostParams)
    } catch (e) {
      throw e
    }
  } catch (e) {
    if (e.code === 'NoSuchBucket') {
      await utils.sleep(2000)
      return configureBucketForHosting(cos, bucketName, appid, region)
    }
    throw e
  }
}

module.exports = {
  configureBucketForHosting
}
