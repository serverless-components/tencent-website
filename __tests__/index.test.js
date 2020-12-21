const path = require('path')
const axios = require('axios')
const { generateId, getServerlessSdk } = require('./lib/utils')

const instanceYaml = {
  org: 'orgDemo',
  app: 'appDemo',
  component: 'website@dev',
  name: `website-integration-tests-${generateId()}`,
  stage: 'dev',
  inputs: {
    src: {
      src: path.join(__dirname, '..', 'example/src'),
      index: 'index.html',
      error: 'index.html'
    },
    bucketName: 'my-bucket',
    region: 'ap-guangzhou',
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
  // exist page
  const { data } = await axios.get(instance.outputs.website)
  expect(data).toContain('Serverless Framework');

  // not exist page
  try {
    await axios.get(`${instance.outputs.website}/error.html`)
  } catch (e) {
    const { response } = e
    expect(response.data).toContain('Serverless Framework');
    expect(response.status).toBe(404)
  }
})

it('should update success', async () => {
  instanceYaml.inputs.disableErrorStatus = true
  const instance = await sdk.deploy(instanceYaml, credentials)

  expect(instance).toBeDefined()
  expect(instance.instanceName).toEqual(instanceYaml.name)
  expect(instance.outputs.website).toBeDefined()
  expect(instance.outputs.region).toEqual(instanceYaml.inputs.region)
  // exist page
  const { data } = await axios.get(instance.outputs.website)
  expect(data).toContain('Serverless Framework');
  // not exist page
  const res = await axios.get(`${instance.outputs.website}/error.html`)
  expect(res.data).toContain('Serverless Framework');
  expect(res.status).toBe(200)
})

it('should remove success', async () => {
  await sdk.remove(instanceYaml, credentials)
  result = await sdk.getInstance(instanceYaml.org, instanceYaml.stage, instanceYaml.app, instanceYaml.name)

  expect(result.instance.instanceStatus).toEqual('inactive')
})
