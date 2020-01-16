[![Serverless Framework Tencent Cloud Plugin](https://img.serverlesscloud.cn/202019/1578569597879-website.png)](http://serverless.com)

&nbsp;

Leverage this Serverless Component to deploy a website hosted on serverless infrastructure on Tencent within seconds. Easily add in your Vue.js, React.js or static assets and more.

&nbsp;

- [请点击这里查看中文版部署文档](./README.md)

&nbsp;

1. [Install](#1-install)
2. [Create](#2-create)
3. [Configure](#3-configure)
4. [Deploy](#4-deploy)
5. [Remove](#5-remove)

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

Use the following command to create `serverless.yml` and `.env` files

```console
$ touch serverless.yml
$ touch .env # your Tencent API Keys
```

Add the access keys of a [Tencent CAM Role](https://console.cloud.tencent.com/cam/capi) with `AdministratorAccess` in the `.env` file, using this format:

```
# .env
TENCENT_SECRET_ID=XXX
TENCENT_SECRET_KEY=XXX
```

**Note:** If you don't have a Tencent Cloud account, you could [sign up](https://intl.cloud.tencent.com/register) first.

Move/Create your code in the folder, and the directory should look something like this:

```
|- code
  |- index.html
|- serverless.yml
|- .env      # your Tencent SecretId/Key/AppId

```

- If you don't have a Tencent Cloud account, you could [sign up](https://intl.cloud.tencent.com/register) first.

**Note:** The `code` directory could either be a simple directory of html/css/js assets files, or a full fledged React app.

For this example, you could add the code to index.html file:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Hello, Tencent Cloud</title>
  </head>
  <body>
    Hello, Tencent Cloud
  </body>
</html>
```

### 3. Configure

```yml
# serverless.yml

myWebsite:
  component: '@serverless/tencent-website'
  inputs:
    code:
      src: ./code
      index: index.html
      error: index.html
    region: ap-guangzhou
    bucketName: my-bucket
```

- [Click here to view the configuration document](https://github.com/serverless-tencent/tencent-website/blob/master/docs/configure.md)

### 4. Deploy

```console
$ sls --debug

    DEBUG ─ Resolving the template's static variables.
    DEBUG ─ Collecting components from the template.
    DEBUG ─ Downloading any NPM components found in the template.
    DEBUG ─ Analyzing the template's components dependencies.
    DEBUG ─ Creating the template's components graph.
    DEBUG ─ Syncing template state.
    DEBUG ─ Executing the template's components graph.
    DEBUG ─ Starting Website Component.
    DEBUG ─ Preparing website Tencent COS bucket my-bucket-1300415943.
    DEBUG ─ Deploying "my-bucket-1300415943" bucket in the "ap-guangzhou" region.
    DEBUG ─ "my-bucket-1300415943" bucket was successfully deployed to the "ap-guangzhou" region.
    DEBUG ─ Setting ACL for "my-bucket-1300415943" bucket in the "ap-guangzhou" region.
    DEBUG ─ Ensuring no CORS are set for "my-bucket-1300415943" bucket in the "ap-guangzhou" region.
    DEBUG ─ Ensuring no Tags are set for "my-bucket-1300415943" bucket in the "ap-guangzhou" region.
    DEBUG ─ Configuring bucket my-bucket-1300415943 for website hosting.
    DEBUG ─ Uploading website files from /Users/dfounderliu/Desktop/temp/code/src to bucket my-bucket-1300415943.
    DEBUG ─ Starting upload to bucket my-bucket-1300415943 in region ap-guangzhou
    DEBUG ─ Uploading directory /Users/dfounderliu/Desktop/temp/code/src to bucket my-bucket-1300415943
    DEBUG ─ Website deployed successfully to URL: https://my-bucket-1300415943.cos-website.ap-guangzhou.myqcloud.com.

    myWebsite:
      url: https://my-bucket-1300415943.cos-website.ap-guangzhou.myqcloud.com
      env:

    2s › myWebsite › done


```

### 5. Remove

```text
$ sls remove --debug

  DEBUG ─ Flushing template state and removing all components.
  DEBUG ─ Starting Website Removal.
  DEBUG ─ Removing Website bucket.
  DEBUG ─ Removing files from the "my-bucket-1300415943" bucket.
  DEBUG ─ Removing "my-bucket-1300415943" bucket from the "ap-guangzhou" region.
  DEBUG ─ "my-bucket-1300415943" bucket was successfully removed from the "ap-guangzhou" region.
  DEBUG ─ Finished Website Removal.

  3s › myWebsite › done


```

&nbsp;

### New to Components?

Checkout the [Serverless Components](https://github.com/serverless/components) repo for more information.
