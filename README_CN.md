[![Serverless Website Tencent Cloud](https://s3.amazonaws.com/assets.github.serverless/github_readme_serverless_website_tencent.png)](http://serverless.com)

&nbsp;

# 腾讯云静态网站应用

## 简介

静态网站应用调用了基础的腾讯云COS组件，可以快速部署静态网站页面到对象存储COS中，并生成域名供访问。
* 该应用中使用了新的[COS_SDK](https://github.com/tencentyun/cos-nodejs-sdk-v5/tree/newSDK)

## 快速开始
&nbsp;

操作步骤如下：

1. [安装](#1-安装)
2. [创建](#2-创建)
3. [配置](#3-配置)
4. [部署](#4-部署)
5. [移除](#5-移除)

&nbsp;

### 1. 安装

通过npm安装serverless

```console
$ npm install -g serverless
```

### 2. 创建

本地创建my-website文件夹

```console
$ mkdir my-website
$ cd my-website
```
在文件夹中创建对应的 `serverless.yml` 和 `.env` 两个文件，并将静态页面放在`code`目录下，文件目录结构如下：

```
|- code
  |- index.html
|- serverless.yml
|- .env      # your Tencent SecretId/Key/AppId

```

在 `.env` 文件中配置腾讯云的APPID，SecretId和SecretKey信息并保存

如果没有腾讯云账号，可以在此[注册新账号](https://cloud.tencent.com/register)。

如果已有腾讯云账号，可以在[API密钥管理
](https://console.cloud.tencent.com/cam/capi)中获取`APPID`, `SecretId` 和`SecretKey`.

```
# .env
TENCENT_SECRET_ID=123
TENCENT_SECRET_KEY=123
TENCENT_APP_ID=123
```

* `code`目录下应该对应html/css/js资源的文件，或者一个完整的React应用

示例html[下载地址](https://tinatest-1251971143.cos.ap-beijing.myqcloud.com/index.html)

### 3. 配置

在serverless.yml中进行如下配置

```yml
# serverless.yml

name: my-website
stage: dev

myWebsite:
  component: "@serverless/tencent-website"
  inputs:
    code:
      root: ./ 
      src: ./code # 代码上传的目录位置
      hook: npm run build # 上传之前执行的脚本，用于打包/测试代码（可选）
    region: ap-guangzhou # 部署website应用的对应地域
    bucketName: mybucket # COS bucket当前不支持大写字母命名
    env: # 环境变量，会被上传到 'env.js' 文件中
      API_URL: https://api.com
```

### 4. 部署

通过如下命令进行部署，并查看部署过程中的信息
```console
$ serverless --debug
```

### 5. 移除

通过以下命令移除部署的API网关
```console
$ serverless remove --debug
```

### 测试案例
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

### 还支持哪些组件？

可以在 [Serverless Components](https://github.com/serverless/components) repo 中查询更多组件的信息。
