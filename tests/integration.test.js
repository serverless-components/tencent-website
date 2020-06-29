const { generateId, getServerlessSdk } = require('./utils')

// set enough timeout for deployment to finish
jest.setTimeout(60000)

// the yaml file we're testing against
const instanceYaml = {
  org: 'orgDemo',
  app: 'appDemo',
  component: 'website@dev',
  name: `website-integration-tests-${generateId()}`,
  stage: 'dev',
  inputs: {
    src: './example',
    bucketName: 'my-bucket'
    // region: 'ap-guangzhou'
  }
}

process.env.SERVERLESS_PLATFORM_VENDOR = 'tencent'
process.env.TENCENT_SECRET_ID = ''
process.env.TENCENT_SECRET_KEY = ''
process.env.SERVERLESS_PLATFORM_STAGE = 'dev'

// get credentials from process.env but need to init empty credentials object
const credentials = {
  tencent: {}
}

// get serverless construct sdk
const sdk = getServerlessSdk(instanceYaml.org)

// clean up the instance after tests
afterAll(async () => {
  await sdk.remove(instanceYaml, credentials)
})

it('should successfully deploy website app', async () => {
  const instance = await sdk.deploy(instanceYaml, { tencent: {} })

  expect(instance).toBeDefined()
  expect(instance.instanceName).toEqual(instanceYaml.name)
  expect(instance.outputs.website).toBeDefined()
})

it('should successfully remove website app', async () => {
  await sdk.remove(instanceYaml, credentials)
  result = await sdk.getInstance(instanceYaml.org, instanceYaml.stage, instanceYaml.app, instanceYaml.name)

  // remove action won't delete the service cause the apigw have the api binded
  expect(result.instance.instanceStatus).toEqual('inactive')
})
