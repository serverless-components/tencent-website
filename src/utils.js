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
  console.log(`Packaging ${CONFIGS.compFullname} application...`)

  // unzip source zip file
  let zipPath
  if (!code.src) {
    // add default template
    const downloadPath = `/tmp/${generateId()}`
    const filename = 'template'

    console.log(`Installing Default ${CONFIGS.compFullname} App...`)
    await download(CONFIGS.templateUrl, downloadPath, {
      filename: `${filename}.zip`
    })
    zipPath = `${downloadPath}/${filename}.zip`
  } else {
    zipPath = code.src
  }

  return zipPath
}

const removeAppid = (str, appid) => {
  const suffix = `-${appid}`
  if (!str || str.indexOf(suffix) === -1) {
    return str
  }
  return str.slice(0, -suffix.length)
}

const prepareInputs = async (instance, inputs) => {
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
  console.log(`Files unzipped into ${sourceDirectory}`)

  const region = inputs.region || CONFIGS.region
  const bucketName =
    removeAppid(inputs.bucketName, appId) || `sls-website-${region}-${generateId()}`

  const websiteInputs = Object.assign(inputs, {
    replace: inputs.replace,
    useDefault: !code.src,
    code: {
      src: sourceDirectory,
      index: (inputs.srcOriginal && inputs.srcOriginal.index) || CONFIGS.indexPage,
      error: (inputs.srcOriginal && inputs.srcOriginal.error) || CONFIGS.errorPage,
      envPath: path.join(sourceDirectory, envPath)
    },
    env: inputs.env,
    bucket: `${bucketName}-${appId}`,
    region: region,
    protocol: inputs.protocol || CONFIGS.protocol,
    cors: inputs.cors
  })

  // auto setup acl for public-read
  if (inputs.autoSetupAcl !== false) {
    websiteInputs.acl = CONFIGS.acl
  }

  // auto setup policy for public read
  if (inputs.autoSetupPolicy === true) {
    websiteInputs.policy = CONFIGS.getPolicy(region, bucketName, appId)
  }

  return websiteInputs
}

module.exports = {
  generateId,
  getCodeZipPath,
  prepareInputs
}
