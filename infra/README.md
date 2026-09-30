# 基础设施与部署

## 目录

```text
infra/
├── .local.example        # 服务器连接配置示例
├── .local                # 本机连接信息，由 Git 忽略
├── certs/                # www、ctf、mail 证书与私钥，由 Git 忽略
├── nginx/                # 三个业务域名统一使用 nkisa.conf
└── deploy/
    ├── www/              # 主页打包、发布与回退
    ├── ctf/              # Compose、应用配置模板与维护入口
    └── mail/             # 邮件入口与证书维护说明
```

## 按服务查找

| 服务 | 应用目录 | 部署资料 | 当前状态 |
| --- | --- | --- | --- |
| 主页 | [www](../www/README.md) | [www 部署](deploy/www/README.md) | 静态站点，经 `current` 链接切换发布版本 |
| CTF | [ctf](../ctf/README.md) | [CTF 部署](deploy/ctf/README.md) | `/srv/nkisa/ctf/` 中运行 GZCTF 与 PostgreSQL |
| 邮件 | [mail](../mail/README.md) | [mail 部署](deploy/mail/README.md) | 已配置 HTTPS，邮件应用待部署 |

[Nginx 配置](nginx/README.md)由服务器现有配置整理而来，本地模板将三个域名统一放在 `nginx/sites-available/nkisa.conf`，线上待部署时迁移。

## 配置与凭据

- 本机服务器连接信息放在 `.local`，结构见 [.local.example](.local.example)。
- 证书与私钥位置见 [certs](certs/README.md)。
- CTF 的 `.env.example` 和 `appsettings.json.example` 可以提交，真实 `.env`、`appsettings.json` 与 `data/` 由 Git 忽略。
- 本地主页发布包生成到 `deploy/www/.releases/`，由 Git 忽略。配置模板只保留当前版本。

## 使用约定

各部署目录的 README 给出具体命令。发布前核对服务器现状；三个域名的 Nginx 配置由公共部署步骤统一安装、检查和重载。

本次补齐资料只读取了服务器配置，未执行线上发布、服务重启或数据库变更。
