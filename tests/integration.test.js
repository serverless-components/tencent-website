const path = require('path')
require('dotenv').config({path: path.join(__dirname, '..', '.env.test')})
const { generateId, getServerlessSdk } = require('./utils')

// set enough timeout for deployment to finish
jest.setTimeout(300000)

// the yaml file we're testing against
const instanceYaml = {
  org: 'orgDemo',
  app: 'appDemo',
  component: 'website',
  name: `website-integration-tests-${generateId()}`,
  stage: 'dev',
  inputs: {
    src: path.join(__dirname, '..', 'example'),
    bucketName: 'my-bucket',
    region: 'ap-guangzhou'
  }
}

const credentials = {
  tencent: {
    SecretId: process.env.TENCENT_SECRET_ID,
    SecretKey: process.env.TENCENT_SECRET_KEY,
  }
}

// get serverless construct sdk
const sdk = getServerlessSdk(instanceYaml.org)

it('should successfully deploy website app', async () => {
  const instance = await sdk.deploy(instanceYaml, credentials)

  expect(instance).toBeDefined()
  expect(instance.instanceName).toEqual(instanceYaml.name)
  expect(instance.outputs.website).toBeDefined()
  expect(instance.outputs.region).toEqual(instanceYaml.inputs.region)
})

it('should successfully remove website app', async () => {
  await sdk.remove(instanceYaml, credentials)
  result = await sdk.getInstance(instanceYaml.org, instanceYaml.stage, instanceYaml.app, instanceYaml.name)

  expect(result.instance.instanceStatus).toEqual('inactive')
})
