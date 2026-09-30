# 主页部署

## 当前线上状态

2026-09-30 核对：

- 地址：<https://www.nkisa.com/>。
- 项目源码：[`www/`](../../../www/README.md)，在该目录执行 npm 命令。
- 当前版本：`20260929T094646Z`。
- 服务器入口：`/var/www/nkisa/current` → `/var/www/nkisa/releases/20260929T094646Z`。
- 线上 Nginx：`/etc/nginx/sites-available/nkisa.conf` 包含主页和 CTF，邮件仍使用独立配置。本地模板已合并三个域名，迁移步骤见 [Nginx 说明](../../nginx/README.md)。
- 首次发布版本：`20260929T093344Z`；第二次发布修复 iOS 把装饰星号显示为 emoji 的问题。

## 准备下一次发布

在仓库根目录执行：

```bash
cd www
npm ci
cd ..
python3 infra/deploy/www/prepare.py
```

脚本运行 lint、构建，然后在 `infra/deploy/www/.releases/<发布编号>/` 生成：

```text
site/             # 静态文件
site.sha256       # 所有静态文件的校验清单
release-id
release.json
activate.sh
rollback.sh
```

这一步只操作本地文件，不连接服务器。发布包由 Git 忽略；源码、脚本和文档进入版本管理。需要指定编号时使用 `--release-id YYYYMMDDTHHMMSSZ`，同一编号不能覆盖使用。

## 上传与切换版本

下面命令需要将 `RELEASE_ID` 替换为刚生成的编号，将 `SERVER` 替换为已配置的 SSH 地址。服务器连接配置示例位于 [`infra/.local.example`](../../.local.example)。

```bash
scp -r infra/deploy/www/.releases/RELEASE_ID SERVER:nkisa-deploy/releases/
ssh SERVER 'readlink /var/www/nkisa/current'
```

检查刚输出的当前版本。然后登录服务器，将其完整路径作为最后一个参数执行：

```bash
sudo bash /home/xzy/nkisa-deploy/releases/RELEASE_ID/activate.sh /var/www/nkisa/releases/EXPECTED_CURRENT_ID
```

`activate.sh` 面向当前 Ubuntu/Nginx 安装，需要 `bash`、`flock`、`sha256sum`、`curl` 和 sudo 权限。它检查预期版本、文件校验和与 Nginx 语法，将新文件放入独立版本目录，再原子切换 `current`。最后通过本机 HTTPS 虚拟主机逐一验证静态文件；失败时自动切回原版本。切换只更新主页静态文件，不写入 Nginx 配置；已有 Nginx 通过 `current` 链接读取文件，无需重载。

部署成功后检查公网主页和关键交互。脚本会输出回退命令：

```bash
sudo bash /var/backups/nkisa/www/RELEASE_ID/rollback.sh
```

回退脚本只在该次发布仍为当前版本时切回原版本，保留全部发布文件。不要直接从源码目录运行 `rollback.sh`，它需要部署时生成的 `previous-target` 和 `deployed-target`。
