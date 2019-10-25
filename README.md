# website

&nbsp;

Deploy a static website to Tencent COS in seconds using [Serverless Components](https://github.com/serverless/components).

* new COS_SDK : https://github.com/tencentyun/cos-nodejs-sdk-v5/tree/newSDK

&nbsp;

1. [Install](#1-install)
2. [Create](#2-create)
3. [Configure](#3-configure)
4. [Deploy](#4-deploy)

&nbsp;

### 1. Install

```console
$ npm install -g serverless
```

### 2. Create

```console
$ mkdir my-website
$ cd my-website
```

the directory should look something like this:


```
|- code
  |- index.html
|- serverless.yml
|- .env      # your Tencent SecretId/Key/AppId

```

```
# .env
TENCENT_SECRET_ID=123
TENCENT_SECRET_KEY=123
TENCENT_APP_ID=123
```

The `code` directory could either be a simple directory of html/css/js assets files, or a full fledged React app.

### 3. Configure

```yml
# serverless.yml

name: my-website
stage: dev

myWebsite:
  component: "@serverless/tencent-website"
  inputs:
    code:
      root: ./ # The root folder of your website project.  Defaults to current working directory
      src: ./src # The folder to be uploaded containing your built artifact
      hook: npm run build # A hook to build/test/do anything to your code before uploading
      # index: index.html # default index.html
      error: index.html # default error.html
    region: ap-guangzhou # The Tencent region to deploy your website into
    bucketName: myBucket
    env: # Environment variables to include in a 'env.js' file with your uploaded code.
      API_URL: https://api.com
    cors:
      - allowedOrigins:
          - '*.tencent.com'
          - '*.qcloud.com'
        allowedMethods:
          - PUT
          - POST
          - DELETE
          - HEAD
        allowedHeaders: '*'
        maxAgeSeconds: 0
      - allowedOrigins:
          - '*'
        allowedMethods:
          - GET
        allowedHeaders: '*'
        maxAgeSeconds: 0
```

### 4. Deploy

```console
$ serverless

```

### Test
```text
DFOUNDERLIU-MB0:temp dfounderliu$ sls --debug

  DEBUG ─ Resovling the template's static variables.
  DEBUG ─ Collecting components from the template.
  DEBUG ─ Downloading any NPM components found in the template.
  DEBUG ─ Analyzing the template's components dependencies.
  DEBUG ─ Creating the template's components graph.
  DEBUG ─ Syncing template state.
  DEBUG ─ Executing the template's components graph.
  DEBUG ─ Starting Website Component.
  DEBUG ─ Preparing website Tencent COS bucket mytssdfdfdestbuckettestmytestbuckettest-1256773370.
  DEBUG ─ Deploying "mytssdfdfdestbuckettestmytestbuckettest-1256773370" bucket in the "ap-guangzhou" region.
  DEBUG ─ "mytssdfdfdestbuckettestmytestbuckettest-1256773370" bucket was successfully deployed to the "ap-guangzhou" region.
  DEBUG ─ Setting ACL for "mytssdfdfdestbuckettestmytestbuckettest-1256773370" bucket in the "ap-guangzhou" region.
  DEBUG ─ Ensuring no CORS are set for "mytssdfdfdestbuckettestmytestbuckettest-1256773370" bucket in the "ap-guangzhou" region.
  DEBUG ─ Ensuring no Tags are set for "mytssdfdfdestbuckettestmytestbuckettest-1256773370" bucket in the "ap-guangzhou" region.
  DEBUG ─ Configuring bucket mytssdfdfdestbuckettestmytestbuckettest-1256773370 for website hosting.
  DEBUG ─ Uploading website files from /Users/dfounderliu/Desktop/temp/code to bucket mytssdfdfdestbuckettestmytestbuckettest-1256773370.
  DEBUG ─ Starting upload to bucket mytssdfdfdestbuckettestmytestbuckettest-1256773370 in region ap-guangzhou
  DEBUG ─ Uploading directory /Users/dfounderliu/Desktop/temp/code to bucket mytssdfdfdestbuckettestmytestbuckettest-1256773370
  DEBUG ─ Website deployed successfully to URL: https://mytssdfdfdestbuckettestmytestbuckettest-1256773370.cos.ap-guangzhou.myqcloud.com.

  myWebsite: 
    url: https://mytssdfdfdestbuckettestmytestbuckettest-1256773370.cos.ap-guangzhou.myqcloud.com
    env: 

  2s › myWebsite › done

DFOUNDERLIU-MB0:temp dfounderliu$ sls remove --debug

  DEBUG ─ Flushing template state and removing all components.
  DEBUG ─ Starting Website Removal.
  DEBUG ─ Removing Website bucket.
  DEBUG ─ Removing files from the "mytssdfdfdestbuckettestmytestbuckettest-1256773370" bucket.
  DEBUG ─ Removing "mytssdfdfdestbuckettestmytestbuckettest-1256773370" bucket from the "ap-guangzhou" region.
  DEBUG ─ "mytssdfdfdestbuckettestmytestbuckettest-1256773370" bucket was successfully removed from the "ap-guangzhou" region.
  DEBUG ─ Finished Website Removal.

  3s › myWebsite › done

```

&nbsp;

### New to Components?

Checkout the [Serverless Components](https://github.com/serverless/components) repo for more information.
