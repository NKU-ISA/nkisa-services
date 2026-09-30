# 邮件入口与部署

域名为 `mail.nkisa.com`，已安装 HTTPS 证书。当前邮件应用、SMTP 和 IMAP 尚未部署，HTTPS 返回 `503` 和“邮件服务筹备中。”。

## 统一站点配置

邮件的 HTTP 跳转与 HTTPS `server` 块统一维护在 [nkisa.conf](../../nginx/sites-available/nkisa.conf)，与主页、CTF 一起部署。迁移步骤和公共配置维护方式见 [Nginx 说明](../../nginx/README.md)。

本目录不再保留独立的邮件站点配置和首次安装脚本。后续增加邮件应用时，在应用目录 `mail/` 放项目代码，在这里补充服务部署步骤，并修改统一配置中的邮件入口。

## 证书

- 本地材料：`infra/certs/mail/mail.nkisa.com.pem` 与 `mail.nkisa.com.key`，由 Git 忽略。
- 服务器证书：`/etc/nginx/tls/mail.nkisa.com.pem`。
- 服务器私钥：`/etc/nginx/tls/mail.nkisa.com.key`，所有者 root，权限 `0600`。
- 当前证书有效期至 2026-12-26 23:59:59 UTC，尚未配置自动续期。

更新证书后，由公共 Nginx 部署步骤检查配置并重载，同时验证三个域名的证书与响应。证书材料的保存约定见 [certs](../../certs/README.md)。
