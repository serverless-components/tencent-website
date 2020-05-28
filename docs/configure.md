# 配置文档

## 全量参数

```yml
# serverless.yml

component: tencent-website
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
    # websitePath: ./
  region: ap-guangzhou
  bucketName: my-bucket
  protocol: http
  hosts:
    - host: anycoder.cn
    - host: abc.com
      async: true
      autoRefesh: true
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
      https:
        switch: on
        http2: on
        certInfo:
          certId: 'abc'
          # certificate: 'xxx'
          # privateKey: 'xxx'
  env:
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

## 配置描述

主要参数描述

| 参数名称           | 是否必选 |    默认值    | 描述                                                                                      |
| ------------------ | :------: | :----------: | :---------------------------------------------------------------------------------------- |
| [src](#执行目录)   |    是    |              | 该项目的代码信息，参数参考执行目录                                                        |
| region             |    否    | ap-guangzhou | 代码上传所在的 cos 区域。默认为广州区。                                                   |
| bucketName         |    是    |              | Bucket 名称。 不允许大写字母。如果你不加 AppId 后缀，则默认自动会为你加上。               |
| protocol           |    否    |    https     | 请求协议。Https 或 http                                                                   |
| env                |    否    |              | 环境变量参数文件。会将 env 下配置的参数写入 env.js 文件中，将该文件打包上传到你的代码里。 |
| envPath            |    否    |              | 生成的 env.js 存放在你项目中的路径。默认是当前工作路径。                                  |
| [cors](#跨域配置)  |    否    |              | 跨域访问配置                                                                              |
| [hosts](#CDN-配置) |    否    |              | CND 加速域名配置                                                                          |

### 执行目录

| 参数名称    | 是否必选 |   默认值   | 描述                                                         |
| ----------- | :------: | :--------: | :----------------------------------------------------------- |
| src         |    是    |            | 你构建的项目代码目录。                                       |
| websitePath |    否    |            | 网站根目录。                                                 |
| dist        |    否    |            | 钩子脚本执行构建后，输出的目录。如果配置 `hook`， 此参数必填 |
| hook        |    否    |            | 钩子脚本。在你项目代码上传之前执行。                         |
| index       |    否    | index.html | 网站 index 页面                                              |
| error       |    否    | error.html | 网站 error 页面                                              |

### 跨域配置

参考： https://cloud.tencent.com/document/product/436/8279

| 参数           | 是否必选 | 类型     | Description                                                                                    |
| -------------- | :------: | -------- | :--------------------------------------------------------------------------------------------- |
| id             |    否    | String   | 规则 ID                                                                                        |
| allowedMethods |    是    | String[] | 允许的 HTTP 操作，枚举值：GET，PUT，HEAD，POST，DELETE                                         |
| allowedOrigins |    是    | String[] | 允许的访问来源，支持通配符`*`，格式为：`协议://域名[:端口]`，例如：`http://www.qq.com`         |
| allowedHeaders |    是    |          | 在发送 OPTIONS 请求时告知服务端，接下来的请求可以使用哪些自定义的 HTTP 请求头部，支持通配符`*` |
| maxAgeSeconds  |   shi    |          | 设置 OPTIONS 请求得到结果的有效期                                                              |

### CDN 配置

| 参数名称   | 是否必选 | 默认    | 描述                                                                              |
| ---------- | -------- | ------- | --------------------------------------------------------------------------------- |
| async      | 否       | `false` | 是否为异步操作，如果为 true，则不会等待 CDN 创建或更新成功再返回，                |
| autoRefesh | 否       | `false` | 是否自动刷新预热 CDN                                                              |
| onlyRefesh | 否       | `false` | 是否只刷新预热 CDN，如果为 `true`，那么只进行刷新预热操作，不会更新 CDN 配置      |
| refreshCdn | 否       |         | 刷新 CDN 相关配置，参考 [refreshCdn](#refreshCdn)                                 |
| host       | 是       |         | 需要接入的 CDN 域名。                                                             |
| host       | 是       |         | 需要接入的 CDN 域名。                                                             |
| https      | 否       |         | Https 加速配置，参考：https://cloud.tencent.com/document/api/228/30987#Https      |
| cacheKey   | 否       |         | 节点缓存键配置，参考：https://cloud.tencent.com/document/api/228/30987#CacheKey   |
| cache      | 否       |         | 缓存过期时间配置，参考： https://cloud.tencent.com/document/api/228/30987#Cache   |
| referer    | 否       | ''      | 防盗链设置，参考： https://cloud.tencent.com/document/api/228/30987#Referer       |
| ipFilter   | 否       | ''      | IP 黑白名单配置，参考： https://cloud.tencent.com/document/api/228/30987#IpFilter |

> 注意：`async` 参数对于配置多个 CDN 域名需求，或者在 CI 流程中时，建议配置成 `true`，不然会导致 serverless cli 执行超时，或者 CI 流程超时。

#### refreshCdn

| 参数名称 | 是否必选 | 默认 | 描述                |
| -------- | -------- | ---- | ------------------- |
| urls     | 否       | []   | 需要刷新的 CDN 路径 |

更多配置，请移至官方云 API 文档：https://cloud.tencent.com/document/product/228/41123
