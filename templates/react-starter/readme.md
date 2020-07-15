# React starter

## 操作场景

该模板可以快速部署一个基于React的页面

## 操作步骤

### 安装

通过 npm 全局安装 [serverless cli](https://github.com/serverless/serverless)：

```bash
$ npm install -g serverless
```

如果之前您已经安装过 Serverless Framework，可以通过下列命令升级到最新版：

```bash
$ npm update -g serverless
```

### 配置

1. 新建一个本地文件夹，使用 `sls init` 命令，下载相关 template：

```bash
$ serverless init -t vue-starter
```

2. 在项目模板中新建 `.env`，并在其中配置对应的腾
   讯云 SecretId 和 SecretKey 信息：

```text
# .env
TENCENT_SECRET_ID=123
TENCENT_SECRET_KEY=123
```

> 说明:
>
> 1. 如果没有腾讯云账号，请先[注册新账号](https://cloud.tencent.com/register)。
> 2. 如果已有腾讯云账号，可以在
>    [API 密钥管理](https://console.cloud.tencent.com/cam/capi)  中获
>    取**SecretId**和**SecretKey**。

### 部署

配置完成后，进入含有 .env 文件的根目录下，通过以下命令进行部署，创建一个新的云开
发环境，将后台代码部署到 SCF 云函数平台，并通过 website 组件部署静态网站：

```bash
$ sls deploy --all
```

> 注意:
>
> 1. 由于 sls 运行角色限制，需要用户登
>    录[访问管理角色页面](https://console.cloud.tencent.com/cam/role)，手动为
>    **SLS_QcsRole** 添加 **TCBFullAccess** 的策略，否则无法正常运行
> 2. 目前 TCB 端仅支持每月最多创建销毁 4 次环境，请谨慎创建，若超过 4 次部署将会
>    报错

访问命令行输出的 website url，即可查看您的 Serverless 站点。

### 移除

可通过以下命令移除项目：

```bash
$ sls remove --all
```
