const COS = require('cos-nodejs-sdk-v5')
const path = require('path')
const util = require('util')
const fs = require("fs")
const exec = util.promisify(require('child_process').exec)
const {Component, utils} = require('@serverless/core')
const {
	configureBucketForHosting,
} = require('./utils')

/*
 * Website
 */

class Website extends Component {

	/*
	 * Default
	 */


	confirmEnding(sourceStr, targetStr) {
		const start = sourceStr.length - targetStr.length;
		const arr = sourceStr.substr(start, targetStr.length);
		if (arr == targetStr) {
			return true;
		}
		return false;
	}

	async default(inputs = {}) {
		this.context.status('Deploying')
		this.context.debug(`Starting Website Component.`)

		// Default to current working directory
		inputs.code = inputs.code || {}
		inputs.code.root = inputs.code.root ? path.resolve(inputs.code.root) : process.cwd()
		if (inputs.code.src) {
			inputs.code.src = path.join(inputs.code.root, inputs.code.src)
		}
		inputs.region = inputs.region || 'ap-guangzhou'
		inputs.bucketName = this.state.bucketName || inputs.bucketName || this.context.resourceId()

		if (!this.confirmEnding(inputs.bucketName, this.context.credentials.tencent.AppId)) {
			inputs.bucketName = inputs.bucketName + "-" + this.context.credentials.tencent.AppId
		}

		this.context.status(`Preparing Tencent COS Bucket`)
		this.context.debug(`Preparing website Tencent COS bucket ${inputs.bucketName}.`)

		const websiteBucket = await this.load('@serverless/tencent-cos', 'websiteBucket')
		const bucketOutputs = await websiteBucket({
			bucket: inputs.bucketName,
			region: inputs.region
		})
		this.state.bucketName = inputs.bucketName
		await this.save()

		const cos = new COS({
			SecretId: this.context.credentials.tencent.SecretId,
			SecretKey: this.context.credentials.tencent.SecretKey
		});

		this.context.debug(`Configuring bucket ${inputs.bucketName} for website hosting.`)
		await configureBucketForHosting(
			cos,
			inputs.bucketName,
			this.context.credentials.tencent.AppId,
			inputs.region,
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

			const options = {cwd: inputs.code.root}
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
			await websiteBucket.upload({dir: dirToUploadPath})
		} else {
			await websiteBucket.upload({file: dirToUploadPath})
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
