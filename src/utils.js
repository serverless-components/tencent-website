const download = require('download')
const path = require('path')
const CONFIGS = require('./config')

/*
 * Generates a random id
 */
const generateId = () =>
  Math.random()
    .toString(36)
    .substring(6)

const getCodeZipPath = async (instance, code) => {
  console.log(`Packaging ${CONFIGS.frameworkFullname} application...`)

  // unzip source zip file
  let zipPath
  if (!code.src) {
    // add default template
    const downloadPath = `/tmp/${generateId()}`
    const filename = 'template'

    console.log(`Installing Default ${CONFIGS.frameworkFullname} App...`)
    await download(CONFIGS.templateUrl, downloadPath, {
      filename: `${filename}.zip`
    })
    zipPath = `${downloadPath}/${filename}.zip`
  } else {
    zipPath = code.src
  }

  return zipPath
}

const prepareInputs = async (instance, inputs) => {
  console.log('inputs', inputs)
  let code = inputs.src || ''
  code =
    typeof code === 'string'
      ? {
          src: code
        }
      : {
          ...code
        }

  const zipPath = await getCodeZipPath(this, code)
  const { appId } = instance.credentials.tencent.tmpSecrets
  const envPath = (inputs.srcOriginal && inputs.srcOriginal.envPath) || './'
  let sourceDirectory = await instance.unzip(zipPath)
  if (!code.src) {
    sourceDirectory = `${sourceDirectory}/src`
  }
  console.log(`Files unzipped into ${sourceDirectory}...`)

  const region = inputs.region || CONFIGS.region

  return {
    useDefault: !code.src,
    code: {
      src: sourceDirectory,
      index: (inputs.srcOriginal && inputs.srcOriginal.index) || CONFIGS.indexPage,
      error: (inputs.srcOriginal && inputs.srcOriginal.error) || CONFIGS.errorPage,
      envPath: path.join(sourceDirectory, envPath)
    },
    env: inputs.env,
    bucket: `${inputs.bucketName || `sls-website-${region}-${generateId()}`}-${appId}`,
    region: region,
    protocol: inputs.protocol || CONFIGS.protocol,
    cors: inputs.cors
  }
}

module.exports = {
  generateId,
  getCodeZipPath,
  prepareInputs
}
