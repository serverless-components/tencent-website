const path = require('path')
require('dotenv').config({path: path.join(__dirname, '..', '.env.test')})
const axios = require('axios')
const { generateId, getServerlessSdk } = require('./lib/utils')

// the yaml file we're testing against
const instanceYaml = {
  org: 'orgDemo',
  app: 'appDemo',
  component: 'website@dev',
  name: `website-integration-tests-${generateId()}`,
  stage: 'dev',
  inputs: {
    src: path.join(__dirname, '..', 'example/src'),
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

const sdk = getServerlessSdk(instanceYaml.org)

it('should deploy success', async () => {
  const instance = await sdk.deploy(instanceYaml, credentials)

  expect(instance).toBeDefined()
  expect(instance.instanceName).toEqual(instanceYaml.name)
  expect(instance.outputs.website).toBeDefined()
  expect(instance.outputs.region).toEqual(instanceYaml.inputs.region)
  const content = await axios.get(instance.outputs.website)
  expect(content.data).toContain('Serverless Framework');
})

it('should remove success', async () => {
  await sdk.remove(instanceYaml, credentials)
  result = await sdk.getInstance(instanceYaml.org, instanceYaml.stage, instanceYaml.app, instanceYaml.name)

  expect(result.instance.instanceStatus).toEqual('inactive')
})
