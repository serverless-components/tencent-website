const util = require('util')
const {utils} = require('@serverless/core')
const COS = require('cos-nodejs-sdk-v5')

const configureBucketForHosting = async (cos, bucketName, appid, region) => {
	const cosBucketPolicy = {
		version: '2.0',
		Statement: [
			{
				Effect: 'Allow',
				Action: ["permid/280649", "permid/280655"],
				Principal: {qcs: ["qcs::cam::anyone:anyone"]},

				Resource: [`qcs::cos:${region}:uid/${appid}:${bucketName}/*`]
			}
		]
	}

	const staticHostParams = {
		Bucket: bucketName,
		Region: region,
		WebsiteConfiguration: {
			IndexDocument: {
				Suffix: "index.html"
			},
			ErrorDocument: {
				Key: "error.html"
			},
			RedirectAllRequestsTo: {
				Protocol: "https"
			},
		}
	}

	const putPostDeleteHeadRule = {
		AllowedMethods: ['PUT', 'POST', 'DELETE', 'HEAD'],
		AllowedOrigins: ["*.tencent.com", "*.qcloud.com"],
		AllowedHeaders: '*',
		MaxAgeSeconds: 0
	}
	const getRule = {
		AllowedMethods: ['GET'],
		AllowedOrigins: ['*'],
		AllowedHeaders: '*',
		MaxAgeSeconds: 0
	}

	let handler
	try {
		handler = util.promisify(cos.putBucketPolicy.bind(cos));
		try {
			await handler({
				Bucket: bucketName,
				Policy: JSON.stringify(cosBucketPolicy),
				Region: region,
			})
		} catch (e) {
			throw e
		}

		handler = util.promisify(cos.putBucketCors.bind(cos));
		try {
			await handler({
				Bucket: bucketName,
				CORSRules: [putPostDeleteHeadRule, getRule],
				Region: region
			})
		} catch (e) {
			throw e
		}

		handler = util.promisify(cos.putBucketWebsite.bind(cos));
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
	configureBucketForHosting,
}
