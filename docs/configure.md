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
  bucket: my-bucket
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

| 参数名称           | 必选 | 类型            |     默认值     | 描述                                                         |
| ------------------ | :--: | :-------------- | :------------: | :----------------------------------------------------------- |
| src                |  是  | [Src](#Src)     |                | 该项目的代码信息，参数参考执行目录                           |
| bucket             |  是  | string          |                | Bucket 名称。 不允许大写字母。如果你不加 AppId 后缀，则默认自动会为你加上。 |
| region             |  否  | string          | `ap-guangzhou` | 代码上传所在的 cos 区域。区。                                |
| replace            |  否  | boolean         |    `false`     | 是否是替换式部署，如果为 `true`，部署时将 `先删除对应 bucket 的所有旧文件`。 |
| protocol           |  否  | string          |    `https`     | 请求协议。`https` 或 `http`                                  |
| env                |  否  | [Env](#Env)     |                | 环境变量参数文件。会将 env 下配置的参数写入 env.js 文件中，将该文件打包上传到你的代码里。 |
| cors               |  否  | [Cors](#Cors)[] |                | 跨域访问配置                                                 |
| hosts              |  否  | [Cdn](#Cdn)[]   |                | CND 加速域名配置                                             |
| autoSetupAcl       |  否  | boolean         |     `true`     | 自动配置 bucket 访问权限为 ”公有读私有写“                    |
| autoSetupPolicy    |  否  | boolean         |    `false`     | 自动配置 bucket 的 Policy 权限为 ”所有用户资源可读“          |
| disableErrorStatus |  否  | boolean         |    `false`     | 是否禁用错误码，默认 false，不存在文件会返回 404；如果禁用，就会返回 200 |
| ignoreHtmlExt      |  否  | boolean         |    `false`     | 是否忽略 html 扩展名，默认 false                             |

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

| 参数           | 必选 | 类型     | Description                                                  |
| -------------- | :--: | :------- | :----------------------------------------------------------- |
| id             |  否  | string   | 规则 ID                                                      |
| allowedMethods |  是  | string[] | 允许的 HTTP 操作，枚举值：GET，PUT，HEAD，POST，DELETE       |
| allowedOrigins |  是  | string[] | 允许的访问来源，支持通配符`*`，格式为：`协议://域名[:端口]`，例如：`http://www.qq.com` |
| allowedHeaders |  是  | string[] | 在发送 OPTIONS 请求时告知服务端，接下来的请求可以使用哪些自定义的 HTTP 请求头部，支持通配符`*` |
| maxAgeSeconds  |  是  | number   | 设置 OPTIONS 请求得到结果的有效期                            |

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
| https       |  否  | [Https](#Https)                                                       |            | Https 加速配置                                                               |
| cacheKey    |  否  | [CacheKey](#CacheKey)                                                 |            | 节点缓存键配置                                                               |
| cache       |  否  | [Cache](#Cache)                                                       |            | 缓存过期时间配置                                                             |
| referer     |  否  | [Referer](#Referer)                                                   | ''         | 防盗链设置                                                                   |
| ipFilter    |  否  | [IpFilter](#IpFilter)                                                 | ''         | IP 黑白名单配置                                                              |

使用中国境外加速、全球加速时，需要先开通中国境外加速服务。

有关 `area` 参数值说明

```
mainland：中国境内加速
overseas：中国境外加速
global：全球加速
```

> 注意：`async` 参数对于配置多个 CDN 域名需求，或者在 CI 流程中时，建议配置成 `true`，不然会导致 serverless cli 执行超时，或者 CI 流程超时。

更多配置详情，请移至官方云 API 文档：https://cloud.tencent.com/document/product/228/41123

#### RefreshCdn

| 参数名称 | 必选 | 类型     | 默认 | 描述                |
| -------- | :--: | :------- | ---- | ------------------- |
| urls     |  否  | string[] | []   | 需要刷新的 CDN 目录 |

#### PushCdn

| 参数名称 | 必选 | 类型     | 默认 | 描述                |
| -------- | :--: | :------- | ---- | ------------------- |
| urls     |  否  | string[] | []   | 需要预热的 CDN URLs |

#### Https

域名 https 加速配置

| 参数名称       | 必选 | 类型                      | 默认 | 描述                                                         |
| -------------- | :--: | ------------------------- | ---- | ------------------------------------------------------------ |
| Switch         |  是  | string                    |      | https 配置开关。on: 开启；off：关闭；此字段可能返回 null，表示取不到有效值 |
| Http2          |  否  | string                    |      | http2 配置开关。on: 开启；off：关闭；初次启用 https 加速会默认开启 http2 配置 |
| OcspStapling   |  否  | string                    | off  | OCSP 配置开关。on: 开启；off：关闭；此字段可能返回 null，表示取不到有效值 |
| VerifyClient   |  否  | string                    | off  | 客户端证书校验功能。on: 开启；off：关闭；此字段可能返回 null，表示取不到有效值 |
| CertInfo       |  否  | [ServerCert](#ServerCert) |      | 服务端证书配置信息                                           |
| ClientCertInfo |  否  | [ClientCert](#ClientCert) |      | 客户端证书配置信息                                           |
| Spdy           |  否  | string                    | off  | Spdy 配置开关。on: 开启；off：关闭                           |
| SslStatus      |  否  | string                    |      | https 证书部署状态。closed：已关闭；deploying：部署中；deployed：部署成功；failed：部署失败 |
| Hsts           |  否  | [Hsts](#Hsts)             |      | Hsts配置                                                     |
| TlsVersion     |  否  | string[]                  |      | Tls版本设置，仅支持部分Advance域名，支持设置 TLSv1, TLSV1.1, TLSV1.2, TLSv1.3，修改时必须开启连续的版本 |

#### ServerCert

https 加速服务端证书配置

| 参数名称    | 必选 | 类型      | 默认 | 描述                                                    |
| :---------- | ---- | :-------- | ---- | :------------------------------------------------------ |
| CertId      | 否   | string    |      | 服务器证书 ID 在 SSL 证书管理进行证书托管时自动生成     |
| CertName    | 否   | string    |      | 服务器证书名称 在 SSL 证书管理进行证书托管时自动生成    |
| Certificate | 否   | string    |      | 服务器证书信息 上传自有证书时必填，需要包含完整的证书链 |
| PrivateKey  | 否   | string    |      | 服务器密钥信息 上传自有证书时必填                       |
| ExpireTime  | 否   | timestamp |      | 证书过期时间 作为入参配置时无需填充                     |
| DeployTime  | 否   | timestamp |      | 证书颁发时间 作为入参配置时无需填充                     |
| Message     | 否   | string    |      | 证书备注信息                                            |

#### ClientCert

https 客户端证书配置

| 参数名称    | 必选 | 类型      | 默认 | 描述                                       |
| :---------- | ---- | :-------- | ---- | :----------------------------------------- |
| Certificate | 是   | string    |      | 客户端证书 PEM 格式，需要进行 Base 64 编码 |
| CertName    | 否   | string    |      | 客户端证书名称                             |
| ExpireTime  | 否   | timestamp |      | 证书过期时间 作为入参时无需填充            |
| DeployTime  | 否   | timestamp |      | 证书颁发时间 作为入参时无需填充            |

#### Hsts

HSTS 配置

| 参数名称          | 必选 | 类型   | 默认 | 描述                    |
| :---------------- | ---- | :----- | ---- | :---------------------- |
| Switch            | 是   | string |      | 是否开启，on或off。     |
| MaxAge            | 否   | number |      | MaxAge数值              |
| IncludeSubDomains | 否   | string |      | 是否包含子域名，on或off |

#### CacheKey

缓存键配置

| 参数名称     | 必选 | 类型                              | 默认 | 描述                                                         |
| :----------- | ---- | :-------------------------------- | ---- | :----------------------------------------------------------- |
| FullUrlCache | 否   | string                            |      | 是否开启全路径缓存 on：开启全路径缓存（即关闭参数忽略） off：关闭全路径缓存（即开启参数忽略） |
| IgnoreCase   | 否   | string                            |      | 是否忽略大小写缓存                                           |
| Querystring  | 否   | [QuerystringKey](#QuerystringKey) |      | CacheKey中包含请求参数                                       |
| Cookie       | 否   | [CookieKey](#CookieKey)           |      | CacheKey中包含Cookie                                         |
| Header       | 否   | [HeaderKey](#HeaderKey)           |      | CacheKey中包含请求头部                                       |
| CacheTag     | 否   | [CacheTagKey](#CacheTagKey)       |      | CacheKey中包含自定义字符串                                   |
| Scheme       | 否   | [SchemeKey](#SchemeKey)           |      | CacheKey中包含请求协议                                       |
| KeyRules     | 否   | [KeyRule](#KeyRule)[]             |      | 分路径缓存键配置                                             |

#### QuerystringKey

组成CacheKey的一部分

| 名称    | 必选 | 类型   | 默认 | 描述                                                         |
| :------ | ---- | :----- | :--- | :----------------------------------------------------------- |
| Switch  | 是   | string |      | on \| off CacheKey是否由Querystring组成                      |
| Reorder | 否   | string |      | 是否重新排序                                                 |
| Action  | 否   | string |      | includeAll \| excludeAll \| includeCustom \| excludeAll 使用/排除部分url参数 |
| Value   | 否   | string |      | 使用/排除的url参数数组，';' 分割                             |

#### CookieKey

组成CacheKey的一部分

| 名称   | 必选 | 类型   | 默认 | 描述                                      |
| :----- | ---- | :----- | :--- | :---------------------------------------- |
| Switch | 是   | string |      | on \| off 是否使用Cookie作为Cache的一部分 |
| Value  | 否   | string |      | 使用的cookie，';' 分割                    |

#### HeaderKey

组成CacheKey

| 名称   | 必选 | 类型   | 默认 | 描述                               |
| :----- | ---- | :----- | :--- | :--------------------------------- |
| Switch | 否   | string |      | 是否组成Cachekey                   |
| Value  | 否   | string |      | 组成CacheKey的header数组，';' 分割 |

#### CacheTagKey

组成CacheKey的一部分

| 名称   | 必选 | 类型   | 默认 | 描述                                 |
| :----- | ---- | :----- | :--- | :----------------------------------- |
| Switch | 是   | string |      | 是否使用CacheTag作为CacheKey的一部分 |
| Value  | 否   | string |      | 自定义CacheTag的值                   |

#### SchemeKey

作为CacheKey的一部分

| 名称   | 必选 | 类型   | 默认 | 描述                                          |
| :----- | ---- | :----- | :--- | :-------------------------------------------- |
| Switch | 是   | string |      | on \| off 是否使用scheme作为cache key的一部分 |

#### KeyRule

缓存键分路径配置

| 名称         | 必选 | 类型                                | 默认 | 描述                                                         |
| :----------- | ---- | :---------------------------------- | :--- | :----------------------------------------------------------- |
| RulePaths    | 是   | string[]                            |      | CacheType 对应类型下的匹配内容： file 时填充后缀名，如 jpg、txt directory 时填充路径，如 /xxx/test path 时填充绝对路径，如 /xxx/test.html index 时填充 / |
| RuleType     | 是   | string                              |      | 规则类型： file：指定文件后缀生效 directory：指定路径生效 path：指定绝对路径生效 index：首页 |
| FullUrlCache | 是   | string                              |      | 是否开启全路径缓存 on：开启全路径缓存（即关闭参数忽略） off：关闭全路径缓存（即开启参数忽略） |
| IgnoreCase   | 是   | string                              |      | 是否忽略大小写缓存                                           |
| Querystring  | 是   | [RuleQuerystring](#RuleQuerystring) |      | CacheKey中包含请求参数                                       |
| RuleTag      | 是   | string                              |      | 路径缓存键标签，传 user                                      |

#### RuleQuerystring

路径保留参数配置

| 名称   | 必选 | 类型   | 默认 | 描述                                    |
| :----- | ---- | :----- | :--- | :-------------------------------------- |
| Switch | 是   | string |      | on \| off CacheKey是否由Querystring组成 |
| Action | 是   | string |      | includeCustom 包含部分url参数           |
| Value  | 是   | string |      | 使用/排除的url参数数组，';' 分割        |

#### Cache

节点缓存过期时间配置

| 名称        | 必选 | 类型                                                         | 默认 | 描述                 |
| :---------- | ---- | :----------------------------------------------------------- | :--- | :------------------- |
| SimpleCache | 否   | [SimpleCache](#SimpleCache) |      | 基础缓存过期时间配置 |
| RuleCache   | 否   | [RuleCache](#RuleCache)[]                                    |      | 高级路径缓存配置     |

#### SimpleCache

缓存配置基础版本

| 名称               | 必选 | 类型                                  | 默认 | 描述                                                         |
| :----------------- | ---- | :------------------------------------ | :--- | :----------------------------------------------------------- |
| CacheRules         | 是   | [SimpleCacheRule](#SimpleCacheRule)[] |      | 缓存过期时间规则                                             |
| FollowOrigin       | 是   | string                                |      | 遵循源站 Cache-Control: max-age 配置 on：开启 off：关闭      |
| IgnoreCacheControl | 是   | string                                |      | 强制缓存 on：开启 off：关闭，开启后，源站返回的 no-store、no-cache 资源，也将按照 CacheRules 规则进行缓存 |
| IgnoreSetCookie    | 是   | string                                |      | 忽略源站的Set-Cookie头部 on：开启 off：关闭                  |
| CompareMaxAge      | 是   | string                                |      | 高级缓存过期配置，开启时会对比源站返回的 max-age 值与 CacheRules 中设置的缓存过期时间，取最小值在节点进行缓存 on：开启 off：关闭 |
| Revalidate         | 否   | [Revalidate](#Revalidate)             |      | 总是回源站校验                                               |

#### SimpleCacheRule

缓存过期规则配置

| 名称          | 必选 | 类型     | 默认 | 描述                                                         |
| :------------ | ---- | :------- | :--- | :----------------------------------------------------------- |
| CacheType     | 是   | string   |      | 规则类型： all：所有文件生效 file：指定文件后缀生效 directory：指定路径生效 path：指定绝对路径生效 index：首页 |
| CacheContents | 是   | string[] |      | CacheType 对应类型下的匹配内容： all 时填充 * file 时填充后缀名，如 jpg、txt directory 时填充路径，如 /xxx/test path 时填充绝对路径，如 /xxx/test.html index 时填充 / |
| CacheTime     | 是   | number   |      | 缓存过期时间设置 单位为秒，最大可设置为 365 天               |

#### Revalidate

是否回源站校验

| 名称   | 必选 | 类型   | 默认 | 描述                       |
| :----- | ---- | :----- | :--- | :------------------------- |
| Switch | 是   | String |      | on \| off 是否总是回源校验 |
| Path   | 否   | String |      | 只在特定请求路径回源站校验 |

#### RuleCache

缓存配置分路径版本

| 名称        | 必选 | 类型                                | 默认 | 描述                                                         |
| :---------- | ---- | :---------------------------------- | :--- | :----------------------------------------------------------- |
| RulePaths   | 是   | string[]                            |      | CacheType 对应类型下的匹配内容： all 时填充 * file 时填充后缀名，如 jpg、txt directory 时填充路径，如 /xxx/test path 时填充绝对路径，如 /xxx/test.html index 时填充 / |
| RuleType    | 是   | string                              |      | 规则类型： all：所有文件生效 file：指定文件后缀生效 directory：指定路径生效 path：指定绝对路径生效 index：首页 |
| CacheConfig | 是   | [RuleCacheConfig](#RuleCacheConfig) |      | 缓存配置                                                     |

#### RuleCacheConfig

路径缓存缓存配置（三种缓存模式中选取一种）

| 名称         | 必选 | 类型                                                | 默认 | 描述         |
| :----------- | ---- | :-------------------------------------------------- | :--- | :----------- |
| Cache        | 是   | [CacheConfigCache](#CacheConfigCache)               |      | 缓存配置     |
| NoCache      | 是   | [CacheConfigNoCache](#CacheConfigNoCache)           |      | 不缓存配置   |
| FollowOrigin | 是   | [CacheConfigFollowOrigin](#CacheConfigFollowOrigin) |      | 遵循源站配置 |

#### CacheConfigCache

路径缓存缓存配置

| 名称               | 必选 | 类型   | 默认 | 描述                                                         |
| :----------------- | ---- | :----- | :--- | :----------------------------------------------------------- |
| Switch             | 是   | string |      | 缓存配置开关 on：开启 off：关闭                              |
| CacheTime          | 是   | number |      | 缓存过期时间设置 单位为秒，最大可设置为 365 天               |
| CompareMaxAge      | 是   | string |      | 高级缓存过期配置，开启时会对比源站返回的 max-age 值与 CacheRules 中设置的缓存过期时间，取最小值在节点进行缓存 on：开启 off：关闭 |
| IgnoreCacheControl | 是   | string |      | 强制缓存 on：开启 off：关闭 默认为关闭状态，开启后，源站返回的 no-store、no-cache 资源，也将按照 CacheRules 规则进行缓存 |
| IgnoreSetCookie    | 是   | string |      | 当源站返回Set-Cookie头部时，节点是否缓存该头部及body on：开启，不缓存该头部及body off：关闭，遵循用户自定义的节点缓存规则 |

#### CacheConfigNoCache

路径缓存不缓存配置

| 名称       | 必选 | 类型   | 默认 | 描述                              |
| :--------- | ---- | :----- | :--- | :-------------------------------- |
| Switch     | 是   | string |      | 不缓存配置开关 on：开启 off：关闭 |
| Revalidate | 是   | string |      | 总是回源站校验 on：开启 off：关闭 |

#### CacheConfigFollowOrigin

路径缓存遵循源站配置

| 名称   | 必选 | 类型   | 默认 | 描述                                |
| :----- | ---- | :----- | :--- | :---------------------------------- |
| Switch | 是   | string |      | 遵循源站配置开关 on：开启 off：关闭 |

#### Referer

Referer 黑白名单配置，默认为关闭状态

| 名称         | 必选 | 类型                          | 默认 | 描述                                        |
| :----------- | ---- | :---------------------------- | :--- | :------------------------------------------ |
| Switch       | 是   | string                        |      | referer 黑白名单配置开关 on：开启 off：关闭 |
| RefererRules | 否   | [RefererRule](#RefererRule)[] |      | referer 黑白名单配置规则                    |

#### RefererRule

Referer 黑白名单配置规则，针对特定资源生效

| 名称        | 必选 | 类型     | 默认 | 描述                                                         |
| :---------- | ---- | :------- | :--- | :----------------------------------------------------------- |
| RuleType    | 是   | string   |      | 规则类型： all：所有文件生效 file：指定文件后缀生效 directory：指定路径生效 path：指定绝对路径生效 |
| RulePaths   | 是   | string[] |      | RuleType 对应类型下的匹配内容： all 时填充 * file 时填充后缀名，如 jpg、txt directory 时填充路径，如 /xxx/test/ path 时填充绝对路径，如 /xxx/test.html |
| RefererType | 是   | string   |      | referer 配置类型 whitelist：白名单 blacklist：黑名单         |
| Referers    | 是   | string[] |      | referer 内容列表列表                                         |
| AllowEmpty  | 是   | Boolean  |      | 是否允许空 referer true：允许空 referer false：不允许空 referer |

#### IpFilter

IP 黑白名单配置，默认为关闭状态

| 名称        | 必选 | 类型                                    | 默认 | 描述                                                         |
| :---------- | ---- | :-------------------------------------- | :--- | :----------------------------------------------------------- |
| Switch      | 是   | string                                  |      | IP 黑白名单配置开关 on：开启 off：关闭                       |
| FilterType  | 否   | string                                  |      | IP 黑白名单类型 whitelist：白名单 blacklist：黑名单          |
| Filters     | 否   | string[]                                |      | IP 黑白名单列表 支持 X.X.X.X 形式 IP，或 /8、 /16、/24 形式网段 最多可填充 50 个白名单或 50 个黑名单 |
| FilterRules | 否   | [IpFilterPathRule](#IpFilterPathRule)[] |      | IP 黑白名单分路径配置，白名单功能                            |
| ReturnCode  | 否   | number                                  |      | IP 黑白名单验证失败时返回的 HTTP Code 合法值: 400~499        |

#### IpFilterPathRule

IP黑白名单分路径配置

| 名称       | 必选 | 类型     | 默认 | 描述                                                         |
| :--------- | ---- | :------- | :--- | :----------------------------------------------------------- |
| FilterType | 是   | string   |      | IP 黑白名单类型 whitelist：白名单 blacklist：黑名单          |
| Filters    | 是   | string[] |      | IP 黑白名单列表 支持 X.X.X.X 形式 IP，或 /8、 /16、/24 形式网段 最多可填充 50 个白名单或 50 个黑名单 |
| RuleType   | 是   | string   |      | 规则类型： all：所有文件生效 file：指定文件后缀生效 directory：指定路径生效 path：指定绝对路径生效 |
| RulePaths  | 是   | string[] |      | RuleType 对应类型下的匹配内容： all 时填充 * file 时填充后缀名，如 jpg、txt directory 时填充路径，如 /xxx/test/ path 时填充绝对路径，如 /xxx/test.html |

### Env

环境变量参数。serverless 部署时会将 `env` 下配置的参数写入 `env.js` 文件中，将该文件打包上传到相对于 `src` 的 `envPath` 目录，默认为 `src` 指定目录。

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

然后，我们可以在前端项目中给所有的请求 URL 添加 `window.env.API_URL` 前缀，通常在全栈应用中，会使用到。比如在部署完后端服务后会生产后端服务网关 `url`，然后我们将上面的的 `API_URL` 赋值为后端服务的 `url`，就可以做到无需手动引入修改接口链接了。具体使用请参考 [全栈应用案例](https://github.com/serverless-components/tencent-examples/tree/master/fullstack)
