# Configure document

## Complete configuration

```yml
# serverless.yml

myWebsite:
  component: '@serverless/tencent-website'
  inputs:
    code:
      root: ./
      src: ./src
      hook: npm run build
      index: index.html
      error: index.html
    region: ap-guangzhou
    bucketName: my-bucket
    protocol: http
    hosts:
      - host: abc.cn
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

## Configuration description

Main param description

| Param                             | Required/Optional |   Default    | Description                                                                                                             |
| --------------------------------- | :---------------: | :----------: | :---------------------------------------------------------------------------------------------------------------------- |
| [code](#code-param-description)   |     Required      |              | Website code information                                                                                                |
| region                            |     Optional      | ap-guangzhou |                                                                                                                         |
| bucketName                        |     Required      |              | Bucket name, if you don't add the AppId suffix, it will be added automatically for you, capital letters are not allowed |
| protocol                          |     Optional      |    https     | Https or http                                                                                                           |
| env                               |     Optional      |              | Environment variables to include in a 'env.js' file with your uploaded code.                                            |
| envPath                           |     Optional      |              | The generate env file folder of your website project. Defaults to current working directory.                            |
| [cors](#cors-param-description)   |     Optional      |              | Cross-Origin Resource Sharing                                                                                           |
| [hosts](#hosts-param-description) |     Optional      |              | Add domain                                                                                                              |

### code param description

| Param | Required/Optional |  Default   | Description                                                                    |
| ----- | :---------------: | :--------: | :----------------------------------------------------------------------------- |
| root  |     Optional      |            | The root folder of your website project. Defaults to current working directory |
| src   |     Required      |            | The folder to be uploaded containing your built artifact                       |
| hook  |     Optional      |            | A hook to build/test/do anything to your code before uploading                 |
| index |     Optional      | index.html | Index page                                                                     |
| error |     Optional      | error.html | Error page                                                                     |

### cors param description

| Param          | Required/Optional | Description                                                                                                                                      |
| -------------- | :---------------: | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| id             |     Required      | Configured rule ID; optional                                                                                                                     |
| allowedMethods |     Required      | Allowed HTTP operations. Enumerated values: GET, PUT, HEAD, POST, DELETE                                                                         |
| allowedOrigins |     Required      | Allowed origin in the format of protocol://domain name\[:port number], such as http://www.qq.com. Wildcard \* is supported                       |
| allowedHeaders |     Required      | Tells the server what custom HTTP request headers can be used for subsequent requests when the OPTIONS request is sent. Wildcard \* is supported |
| maxAgeSeconds  |     Required      | Sets the validity period of the result of the OPTIONS request                                                                                    |

### hosts param description
