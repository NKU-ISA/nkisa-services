# Nginx 统一站点配置

主页、CTF 和邮件三个域名统一维护在 [nkisa.conf](sites-available/nkisa.conf)，每个域名使用自己的 `server` 块与证书。

配置以 2026-09-30 读取的服务器配置为基础，将邮件的两个 `server` 块合并到 `nkisa.conf`。当前是本地待部署版本，线上尚需按下方步骤迁移启用关系。

## 文件与线上位置

| 本地文件 | 线上位置与用途 |
| --- | --- |
| [nginx.conf](nginx.conf) | `/etc/nginx/nginx.conf`，全局配置与 include 入口 |
| [mime.types](mime.types) | `/etc/nginx/mime.types`，静态资源 MIME 类型 |
| [sites-available/default](sites-available/default) | 默认 HTTP 站点，当前启用 |
| [sites-available/nkisa.conf](sites-available/nkisa.conf) | 三个业务域名共用的 HTTP 跳转、HTTPS 配置 |

当前路由：

- `www.nkisa.com` → `/var/www/nkisa/current`，主页静态文件。
- `ctf.nkisa.com` → `http://127.0.0.1:8080`，GZCTF 容器。
- `mail.nkisa.com` → `503`，提示“邮件服务筹备中。”。
- 三个域名的 HTTP 请求均跳转到对应 HTTPS 地址。

`sites-enabled/` 中业务站点仅启用 `nkisa.conf`，另保留系统默认 HTTP 站点。仓库中的链接使用相对路径，服务器上使用指向 `/etc/nginx/sites-available/` 的绝对路径。`www` 保持第一个 HTTPS `server`，延续默认 TLS 站点行为。

`nginx.conf` 是全局入口，`mime.types` 提供资源类型，`default` 是系统默认 HTTP 站点。业务配置只维护一份，不在各服务部署目录中复制。

## 首次合并时的线上迁移

1. 核对线上 `nkisa.conf`，以及旧邮件启用链接 `/etc/nginx/sites-enabled/zz-mail.nkisa.com.conf` 的目标确为 `/etc/nginx/sites-available/mail.nkisa.com.conf`。
2. 将原业务配置和启用关系备份到 `/var/backups/nkisa/` 下的独立目录。
3. 安装合并后的 `nkisa.conf`，移除旧邮件启用链接。旧邮件配置移入备份，避免维护两份配置。
4. 执行 `nginx -t`，通过后重载。检查失败则恢复原配置和邮件链接。
5. 验证主页与 CTF 返回 `200`，邮件返回预期的 `503`，以及三个域名的 HTTP 跳转和 TLS 证书。

旧邮件链接必须同时停用，避免重复域名配置。备份放在启用目录之外，因为全局配置会加载 `sites-enabled/` 中的全部文件。

## 配置维护

所有服务的站点变更都修改同一份 `nkisa.conf`。修改前读取对应服务器文件，与本地版本比较；备份后安装审阅过的配置。

配置安装完成后，在服务器执行：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

只有配置检查通过后才重载；失败时恢复备份并再次检查。发布主页静态文件使用 [www 部署入口](../deploy/www/README.md)，无需改写这些 Nginx 文件。

TLS 证书路径保持为 `/etc/nginx/tls/`。本地证书材料集中在 [infra/certs](../certs/README.md)，不随配置归档提交。

邮件入口的现状说明见 [mail 部署说明](../deploy/mail/README.md)。仓库只保留当前模板，后续变更交由 Git 记录；服务器发布备份用于故障回退。
