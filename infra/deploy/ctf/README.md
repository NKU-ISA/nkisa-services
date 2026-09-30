# CTF 部署与维护

本目录保存 GZCTF 的可提交部署模板和维护入口，不含应用源码。靶场定制代码预留在 [`ctf/`](../../../ctf/README.md)。模板按 2026-09-30 核对的线上配置整理。

## 当前部署

| 项目 | 已核对的配置 |
| --- | --- |
| 域名 | `ctf.nkisa.com` |
| 服务器目录 | `/srv/nkisa/ctf` |
| Compose 项目 | `nkisa-ctf` |
| GZCTF 镜像 | `registry.cn-shanghai.aliyuncs.com/gztime/gzctf:v1.8.7` |
| 数据库镜像 | `postgres:18-alpine` |
| HTTP 监听 | 宿主机 `127.0.0.1:8080` → 容器 `8080`，由现有 Nginx 转发 |
| PostgreSQL 数据 | `./data/db` → `/var/lib/postgresql` |
| GZCTF 文件 | `./data/files` → `/app/files` |
| 应用配置 | `./appsettings.json` → `/app/appsettings.json`，只读挂载 |
| 题目容器接口 | `/var/run/docker.sock` → `/var/run/docker.sock` |

`db` 健康检查通过后启动 `gzctf`，两者均使用 `unless-stopped` 重启策略。本目录不安装或修改 Nginx、证书及防火墙。

## 文件与秘密

- [`compose.yaml`](compose.yaml)：固定项目名、镜像、网络入口与持久化挂载。
- [`.env.example`](.env.example)：`POSTGRES_PASSWORD`、`GZCTF_ADMIN_PASSWORD` 的占位示例。
- [`appsettings.json.example`](appsettings.json.example)：脱敏应用配置，数据库密码与 `XorKey` 为占位符。
- [`manage.sh`](manage.sh)：默认只校验实际配置；显式 `--up` 才运行 `docker compose up -d`。

实际 `.env`、`appsettings.json`、`data/` 及备份不得提交。限制实际配置文件的读取权限，维护时避免将展开后的 Compose 配置输出到终端或日志。

**模板不能直接覆盖现有服务器配置。** 保留服务器 `.env` 中的原数据库密码和管理员密码，以及 `appsettings.json` 中的原 `XorKey`。逐项比较、合并需要变更的配置。数据库连接串中的密码必须与 `.env` 的 `POSTGRES_PASSWORD` 一致；JSON 中的连接串不会自动替换 `.env` 变量。已有数据库的凭据变更需要单独规划，不能只改环境变量。

当前 SMTP 尚未配置：邮件身份和凭据为空，`Smtp` 为 `localhost:587`。这些示例值不表示邮件可用。

`ForwardedOptions.KnownProxies` 中的 `172.19.0.1` 是此次核对时的 Docker 网络网关。迁移主机或重建网络后，应核实 Nginx 到 GZCTF 的实际代理来源，再更新此地址；不能直接沿用旧网关，也不要清空受信代理限制或改成信任全部地址。其余转发配置保留 `ForwardedHeaders: 7`、`ForwardLimit: 1`。

## 在现有服务器上维护

1. 备份 `/srv/nkisa/ctf/compose.yaml`、`.env`、`appsettings.json`、`data/files` 和数据库，并确认备份可恢复。数据库必须采用一致性备份；运行时单独复制 `data/db` 不足以保证可恢复。若使用目录备份，应安排停机并确认 PostgreSQL 已停止。备份存入受限目录，仓库内可使用已忽略的 `infra/backups/`。
2. 把本目录放到服务器独立暂存目录，比较模板与实际配置，按需手动合并。保留原秘密、数据目录、挂载路径和 Compose 项目名。检查密码一致、代理来源正确后，再继续。
3. 在暂存目录运行校验。服务器需提供 Python 3 和支持 `config --format json` 的 Docker Compose v2+：

   ```bash
   bash ./manage.sh --directory /srv/nkisa/ctf --check
   ```

   省略 `--check` 效果相同。校验解析 Compose 与 JSON，并检查必需的秘密字段非空且已替换占位符。它不连接 Docker daemon、不拉取镜像、不创建容器、不写入配置，也不会输出秘密值。校验不会连接数据库或验证代理来源；密码一致性、实际网关、备份及运行健康状况仍需维护者核实。

4. 确认变更及备份后，显式启动或应用配置：

   ```bash
   bash ./manage.sh --directory /srv/nkisa/ctf --up
   bash ./manage.sh --directory /srv/nkisa/ctf --status
   curl --fail --silent --show-error --output /dev/null http://127.0.0.1:8080/
   curl --fail --silent --show-error --output /dev/null https://ctf.nkisa.com/
   ```

   `--up` 要求 `data/db`、`data/files` 已存在，以便发现错误的部署目录。它只调用 `up -d`，不自动迁移或清理数据；容器启动后仍需查看数据库健康状态、应用日志与网页登录情况。

需要查看日志时，在服务器执行：

```bash
docker compose --project-name nkisa-ctf \
  --project-directory /srv/nkisa/ctf \
  --env-file /srv/nkisa/ctf/.env \
  --file /srv/nkisa/ctf/compose.yaml logs --tail 100 db gzctf
```

本入口不负责首次数据库初始化、数据库大版本升级、密码轮换或服务器迁移。首次部署需要单独准备实际配置、数据目录和可信代理地址。

## 回退

如果只是配置变更，核实是否已发生数据库结构或数据变化，再从同一份备份恢复所需配置并重新校验、应用。涉及数据或版本变更时，先按对应版本的恢复流程确认数据库兼容性，再安排恢复；不要直接把旧数据目录覆盖到运行中的 PostgreSQL。维护脚本不提供自动回退、清库、`down -v` 或卷删除操作。

## 本地模板检查

以下命令仅检查模板语法，不启动本地预览或容器：

```bash
bash -n infra/deploy/ctf/manage.sh
python3 -m json.tool infra/deploy/ctf/appsettings.json.example >/dev/null
docker compose --project-name nkisa-ctf \
  --env-file infra/deploy/ctf/.env.example \
  --file infra/deploy/ctf/compose.yaml config --quiet
```

示例文件含占位符，不能直接用于部署。`manage.sh --check` 面向已准备好的实际配置，会拒绝这些占位符。
