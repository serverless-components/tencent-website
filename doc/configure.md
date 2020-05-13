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
    root: ./
    src: ./src
    hook: npm run build
    index: index.html
    error: index.html
    websitePath: ./
  region: ap-guangzhou
  bucketName: my-bucket
  protocol: http
  hosts:
    - host: anycoder.cn
    - host: abc.com
      fullUrl: on
      cache:
        - type: 0
          rule: all
          time: 1000
        - type: 0
          rule: all
          time: 1000
      cacheMode: simple
      refer:
        - type: 1
          list:
            - 'qq.baidu.com'
            - '*.baidu.com'
      accessIp:
        type: 1
        list:
          - '1.2.3.4'
          - '2.3.4.5'
      https:
        certId: 123
        cert: 123
        privateKey: 123
        http2: off
        httpsType: 2
        forceSwitch: -2
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

| 参数名称                          | 是否必选 |    默认值    | 描述                                                         |
| --------------------------------- | :------: | :----------: | :----------------------------------------------------------- |
| [src](#code-param-description)    |    是    |              | 该项目的代码信息，参数参考执行目录                           |
| region                            |    否    | ap-guangzhou | 代码上传所在的cos区域。默认为广州区。                        |
| bucketName                        |    是    |              | Bucket 名称。 不允许大写字母。如果你不加AppId后缀，则默认自动会为你加上。 |
| protocol                          |    否    |    https     | 请求协议。Https 或 http                                      |
| env                               |    否    |              | 环境变量参数文件。会将env下配置的参数写入env.js文件中，将该文件打包上传到你的代码里。 |
| envPath                           |    否    |              | 生成的env.js存放在你项目中的路径。默认是当前工作路径。       |
| [cors](#cors-param-description)   |    否    |              | 跨域访问配置                                                 |
| [hosts](#hosts-param-description) |    否    |              | CND加速域名配置                                              |

### 执行目录

| 参数名称    | 是否必选 |   默认值   | 描述                                                    |
| ----------- | :------: | :--------: | :------------------------------------------------------ |
| root        |    否    |            | 钩子脚本执行构建后，输出的目录。默认为src所指定的目录。 |
| src         |    是    |            | 你构建的项目代码目录。                                  |
| websitePath |    否    |            | 网站根目录。                                            |
| hook        |    否    |            | 钩子脚本。在你项目代码上传之前执行。                    |
| index       |    否    | index.html | 网站index页面                                           |
| error       |    否    | error.html | 网站error页面                                           |

### 跨域配置

参考： https://cloud.tencent.com/document/product/436/8279 

| 参数           | 是否必选 | 类型     | Description                                                  |
| -------------- | :------: | -------- | :----------------------------------------------------------- |
| id             |    否    | String   | 规则ID                                                       |
| allowedMethods |    是    | String[] | 允许的 HTTP 操作，枚举值：GET，PUT，HEAD，POST，DELETE       |
| allowedOrigins |    是    | String[] | 允许的访问来源，支持通配符`*`，格式为：`协议://域名[:端口]`，例如：`http://www.qq.com` |
| allowedHeaders |    是    |          | 在发送 OPTIONS 请求时告知服务端，接下来的请求可以使用哪些自定义的 HTTP 请求头部，支持通配符`*` |
| maxAgeSeconds  |   shi    |          | 设置 OPTIONS 请求得到结果的有效期                            |

### CDN配置

| 参数名称  | 是否必选 | 默认     | 描述                                                         |
| --------- | -------- | -------- | ------------------------------------------------------------ |
| host      | 是       |          | 需要接入的 CDN 域名。                                        |
| fullUrl   | 否       |          | 过滤参数设置 "on"：关闭过滤参数。 "off"：开启过滤参数。 下载/点播/直播类型，默认开启过滤参数。 静态类型默认关闭过滤参数。 |
| cache     | 否       |          | 缓存过期时间设置，默认为全部文件 30 天，详细说明见下文。     |
| cacheMode | 否       | 'simple' | 缓存模式设置 "simple"：表示缓存完全依赖控制台设置。 "custom"：表示缓存依赖控制台设置的缓存时间和源站吐出的 max-age 的最小值。 |
| refer     | 否       | ''       | 防盗链设置，详细说明见下文。                                 |
| accessIp  | 否       | ''       | IP 黑白名单配置，详细说明见下文。                            |

#### cache

| 参数名称 | 是否必选 | 默认 | 描述                                                         |
| -------- | -------- | ---- | ------------------------------------------------------------ |
| type     | 是       | 0    | 缓存类型 - 0：全部类型，表示匹配所有文件，默认缓存配置。 - 1：文件类型，表示按文件后缀匹配。 - 2：文件夹类型，表示按目录匹配。 - 3：全路径匹配。 |
| rule     | 是       |      | 匹配规则，对应第一个参数的缓存类型 - 0：固定填充 “all”，表示所有文件。 - 1：后缀，.jps;.js 等，`;` 分隔。 - 2：目录，如 /www/anc;/a/b 等，`;`分隔。 - 3：全路径，如 /a/1.html;/b/2.html 等，`;`分隔。 |
| time     | 是       |      | 缓存过期时间，单位为秒                                       |

**参数示例**

```
[[0,"all",1000],[1,".jpg;.js",2000],[2,"/a;/www/b",3000],[3,"/a/1.html;/b/2.html",1000]]
```

填入规则的优先级，从前往后，从低到高。

#### refer

| 参数名称 | 是否必选 | 默认 | 描述                                                         |
| -------- | -------- | ---- | ------------------------------------------------------------ |
| type     | 是       | 0    | refer 类型 - 0： 不设置防盗链。 - 1：设置黑名单。 - 2：设置白名单。 |
| list     | 是       |      | 具体的名单列表                                               |
| empty    | 是       |      | 是否包含空 refer - 1：包含空 refer。 - 0：不包含空 refer。   |

**参数示例**

```
[1,["qq.baidu.com", "*.baidu.com"],1]
```

#### accessIp

| 参数名称 | 是否必选 | 默认 | 描述                                                         |
| -------- | -------- | ---- | ------------------------------------------------------------ |
| type     | 是       | 0    | 黑名单类型 - 1：黑名单。 - 2：白名单。                       |
| list     | 是       |      | 对应的黑名单 IP 列表，支持/8、/16、/24 格式的网段设置。最多可设置 100 条 IP 黑名单，或者 50 条 IP 白名单 |

**参数示例**

```
{"type":1,"list":["1.2.3.4","2.3.4.5"]}
```

#### https

| 参数名称    | 是否必选 | 默认  | 描述                                                         |
| ----------- | -------- | ----- | ------------------------------------------------------------ |
| httpsType   | 否       |       | Int 配置类型设置 "0" ：清除 HTTPS 配置，无需填写证书及私钥参数 "1"：上传自有证书，并 HTTP 回源 "2"：上传自有证书，并协议跟随回源 "3"：使用托管证书，并 HTTP 回源 "4"：使用托管证书，并 协议跟随回源 1&2 名未配置证书或配置的是自有证书，则 必须上传 cert 及 privateKey 3&4 域名未配置证书或配置的是托管证书，则必须传递 certId |
| cert        | 否       |       | PEM 格式证书，内容必须 `Base64` 编码, 或者是证书路径，如果是相对路径，则是相对当前项目根目录的路径 |
| privateKey  | 否       |       | PEM 格式私钥，内容必须 `Base64` 编码, 或者是私钥路径，如果是相对路径，则是相对当前项目根目录的路径 |
| forceSwitch | 否       | `-2`  | 强制跳转开关 "1"：HTTP 强制跳转 "-1"：关闭 HTTP 强制跳转 "2"：开启 HTTPS 强制跳转（302） "-2"：关闭 HTTPS 强制跳转（302） "3"：开启 HTTPS 强制跳转（301） "-3"：关闭 HTTPS 强制跳转（301） 如果开启 `http2`，此参数必须配置为 `2`，开启 HTTPS 强制跳转（302） |
| http2       | 否       | 'off' | HTTP2.0 开关 "on"：开启 HTTP2.0 "off"：关闭 HTTP2.0          |
| certId      | 否       |       | 证书 ID，可通过接口 查询托管证书列表获取，如果设置此项，优先使用它，即使设置了 `cert` 和 `privateKey` |

### 

