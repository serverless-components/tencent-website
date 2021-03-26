# 配置文档

## 全量参数

```yml
# serverless.yml

component: website
name: websitedemo
org: test
app: websiteApp
stage: dev

inputs:
  src:
    src: ./src
    # dist: ./dist
    # hook: npm run build
    index: index.html
    error: index.html
  region: ap-guangzhou
  bucketName: my-bucket
  protocol: http
  replace: false # 是否覆盖式部署
  ignoreHtmlExt: false # 是否是否忽略 html 扩展名，默认 false
  disableErrorStatus: false # 是否禁用错误码，默认 false
  autoSetupAcl: true # 自动配置 bucket 访问权限为 ”公有读私有写“
  autoSetupPolicy: false # 自动配置 bucket 的 Policy 权限为 ”所有用户资源可读“
  env: # 配置前端环境变量
    API_URL: https://api.com
  hosts:
    - host: abc.com
      async: false # 是否同步等待 CDN 配置。配置为 false 时，参数 autoRefresh 自动刷新才会生效，如果关联多域名时，为防止超时建议配置为 true。
      area: mainland
      autoRefresh: true #开启自动 CDN 刷新，用于快速更新和同步加速域名中展示的站点内容
      onlyRefresh: false #建议首次部署后，将此参数配置为 true，即忽略其他 CDN 配置，只进行刷新操作
      https:
        switch: on
        http2: on
        certInfo:
          certId: 'abc'
      cache:
        simpleCache:
          followOrigin: on
          cacheRules:
            - cacheType: all
              cacheContents:
                - '*'
              cacheTime: 1000
      cacheKey:
        fullUrlCache: on
      referer:
        switch: on
        refererRules:
          - ruleType: all
            rulePaths:
              - '*'
            refererType: blacklist
            allowEmpty: true
            referers:
              - 'qq.baidu.com'
              - '*.baidu.com'
      ipFilter:
        switch: on
        filterType: blacklist
        filters:
          - '1.2.3.4'
          - '2.3.4.5'
      forceRedirect:
        switch: on
        redirectType: https
        redirectStatusCode: 301
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

## 配置描述

主要参数描述

| 参数名称           | 必选 | 类型            |     默认值     | 描述                                                                                      |
| ------------------ | :--: | :-------------- | :------------: | :---------------------------------------------------------------------------------------- |
| src                |  是  | [Src](#Src)[]   |                | 该项目的代码信息，参数参考执行目录                                                        |
| bucketName         |  是  | string          |                | Bucket 名称。 不允许大写字母。如果你不加 AppId 后缀，则默认自动会为你加上。               |
| region             |  否  | string          | `ap-guangzhou` | 代码上传所在的 cos 区域。区。                                                             |
| replace            |  否  | boolean         |    `false`     | 是否是替换式部署，如果为 `true`，部署时将 `先删除对应 bucket 的所有旧文件`。              |
| protocol           |  否  | string          |    `https`     | 请求协议。`https` 或 `http`                                                               |
| env                |  否  | [Env](#Env)     |                | 环境变量参数文件。会将 env 下配置的参数写入 env.js 文件中，将该文件打包上传到你的代码里。 |
| cors               |  否  | [Cors](#Cors)[] |                | 跨域访问配置                                                                              |
| hosts              |  否  | [Cdn](#Cdn)[]   |                | CND 加速域名配置                                                                          |
| autoSetupAcl       |  否  | boolean         |     `true`     | 自动配置 bucket 访问权限为 ”公有读私有写“                                                 |
| autoSetupPolicy    |  否  | boolean         |    `false`     | 自动配置 bucket 的 Policy 权限为 ”所有用户资源可读“                                       |
| disableErrorStatus |  否  | boolean         |    `false`     | 是否禁用错误码，默认 false，不存在文件会返回 404；如果禁用，就会返回 200                  |
| ignoreHtmlExt      |  否  | boolean         |    `false`     | 是否忽略 html 扩展名，默认 false                                                          |

> 针对 COS 静态资源托管，通常需要配置所有用户公有读私有写，website 组件因此默认通过配置 `autoSetupAcl` 为 `true`，来帮助用户自动配置访问权限为 `公有读私有写`，由于 COS 针对账号的 ACL 配置条数有 1000 限制，当子账号很多的情况下，通过 `autoSetupAcl` 来配置 ACL 可能超过上限。此时用户可以配置 `autoSetupAcl` 为 `false`，同时配置 `autoSetupPolicy` 为 `true`，来解决此问题。

### Src

执行目录

| 参数名称 | 必选 | 类型   |    默认值    | 描述                                                         |
| -------- | :--: | :----- | :----------: | :----------------------------------------------------------- |
| src      |  是  | string |              | 你构建的项目代码目录。                                       |
| dist     |  否  | string |              | 钩子脚本执行构建后，输出的目录。如果配置 `hook`， 此参数必填 |
| hook     |  否  | string |              | 钩子脚本。在你项目代码上传之前执行。                         |
| index    |  否  | string | `index.html` | 网站 index 页面                                              |
| error    |  否  | string | `error.html` | 网站 error 页面                                              |
| envPath  |  否  | string |              | 生成的 env.js 存放在你项目中的路径。默认是当前工作路径。     |

### Cors

跨域配置

参考： https://cloud.tencent.com/document/product/436/8279

| 参数           | 必选 | 类型     | Description                                                                                    |
| -------------- | :--: | :------- | :--------------------------------------------------------------------------------------------- |
| id             |  否  | string   | 规则 ID                                                                                        |
| allowedMethods |  是  | string[] | 允许的 HTTP 操作，枚举值：GET，PUT，HEAD，POST，DELETE                                         |
| allowedOrigins |  是  | string[] | 允许的访问来源，支持通配符`*`，格式为：`协议://域名[:端口]`，例如：`http://www.qq.com`         |
| allowedHeaders |  是  |          | 在发送 OPTIONS 请求时告知服务端，接下来的请求可以使用哪些自定义的 HTTP 请求头部，支持通配符`*` |
| maxAgeSeconds  |  是  |          | 设置 OPTIONS 请求得到结果的有效期                                                              |

### Cdn

CDN 配置

| 参数名称    | 必选 | 类型                                                                  | 默认       | 描述                                                                         |
| ----------- | :--: | :-------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------- |
| async       |  否  | boolean                                                               | `false`    | 是否为异步操作，如果为 true，则不会等待 CDN 创建或更新成功再返回，           |
| area        |  否  | string                                                                | `mainland` | 域名加速区域                                                                 |
| autoRefresh |  否  | boolean                                                               | `false`    | 是否自动刷新 CDN                                                             |
| onlyRefresh |  否  | boolean                                                               | `false`    | 是否只刷新预热 CDN，如果为 `true`，那么只进行刷新预热操作，不会更新 CDN 配置 |
| refreshCdn  |  否  | [RefreshCdn](#RefreshCdn)                                             |            | 刷新 CDN 相关配置                                                            |
| pushCdn     |  否  | [PushCdn](#PushCdn)                                                   |            | 预热 CDN 相关配置(#pushCdn)                                                  |
| host        |  是  | string                                                                |            | 需要接入的 CDN 域名。                                                        |
| https       |  否  | [Https](https://cloud.tencent.com/document/api/228/30987#Https)       |            | Https 加速配置                                                               |
| cacheKey    |  否  | [CacheKey](https://cloud.tencent.com/document/api/228/30987#CacheKey) |            | 节点缓存键配置                                                               |
| cache       |  否  | [Cache](https://cloud.tencent.com/document/api/228/30987#Cache)       |            | 缓存过期时间配置                                                             |
| referer     |  否  | [Referer](https://cloud.tencent.com/document/api/228/30987#Referer)   | ''         | 防盗链设置                                                                   |
| ipFilter    |  否  | [IpFilter](https://cloud.tencent.com/document/api/228/30987#IpFilter) | ''         | IP 黑白名单配置                                                              |

使用中国境外加速、全球加速时，需要先开通中国境外加速服务。

有关 `area` 参数值说明

```
mainland：中国境内加速
overseas：中国境外加速
global：全球加速
```

> 注意：`async` 参数对于配置多个 CDN 域名需求，或者在 CI 流程中时，建议配置成 `true`，不然会导致 serverless cli 执行超时，或者 CI 流程超时。

更多配置，请移至官方云 API 文档：https://cloud.tencent.com/document/product/228/41123

#### RefreshCdn

| 参数名称 | 必选 | 类型     | 默认 | 描述                |
| -------- | :--: | :------- | ---- | ------------------- |
| urls     |  否  | string[] | []   | 需要刷新的 CDN 目录 |

#### PushCdn

| 参数名称 | 必选 | 类型     | 默认 | 描述                |
| -------- | :--: | :------- | ---- | ------------------- |
| urls     |  否  | string[] | []   | 需要预热的 CDN URLs |

### Env

环境变量参数文件。会将 env 下配置的参数写入 env.js 文件中，将该文件打包上传到你的代码里。

比如配置了:

```yaml
env:
  API_URL: https://api.com
```

那么静态项目根目录下生成的 `env.js` 文件内容如下：

```js
window.env = {}
window.env.API_URL = 'https://api.com'
```

让后我们可以在前端项目中给所有的请求 URL 添加 `window.env.API_URL` 前缀，通常在全栈应用中，会使用到。比如在部署完后端服务后会生产后端服务网关 `url`，然后我们将上面的的 `API_URL` 赋值为后端服务的 `url`，就可以做到无需手动引入修改接口链接了。具体使用请参考 [全栈应用案例](https://github.com/serverless-components/tencent-examples/tree/master/fullstack)
