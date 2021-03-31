# FAQ

## COS 桶 ACL 策略超限

通常报错如下：

```
6s > websiteDemo > Your policy or acl has reached the limit
//...
```

针对 COS 静态资源托管，通常需要配置所有用户公有读私有写，website 组件因此默认通过配置 `autoSetupAcl` 为 `true`，来帮助用户自动配置访问权限为 `公有读私有写`，
由于 COS 针对账号的 `ACL` 配置条数有 `1000` 限制，当子账号很多的情况下，通过 `autoSetupAcl` 来配置 ACL 可能超过上限。
此时用户可以配置 `autoSetupAcl` 为 `false`，同时配置 `autoSetupPolicy` 为 `true`，来解决此问题。如下：

```yaml
app: appDemo
stage: dev
component: website
name: websiteDemo

inputs:
  src:
    src: ./src
    index: index.html
    error: index.html
  region: ap-guangzhou
  bucket: my-bucket
  protocol: https
  # 添加以下配置
  autoSetupAcl: false
  autoSetupPolicy: true
```
