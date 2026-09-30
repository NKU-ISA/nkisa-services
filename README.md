# NKISA 协会项目

南开大学信息安全协会主页、CTF 靶场与邮件服务的协作目录。

## 目录

| 目录 | 用途 |
| --- | --- |
| [www](www/README.md) | 协会主页，React + TypeScript + Vite 项目 |
| [ctf](ctf/README.md) | 靶场项目，预留定制代码位置 |
| [mail](mail/README.md) | 邮件项目，预留应用代码位置 |
| [infra](infra/README.md) | 证书、本地服务器连接配置、Nginx 配置和部署脚本 |
| [design](design/) | Logo 原稿与白色版本的 SVG、PNG、PDF |

各应用的代码和依赖配置直接放在对应目录。服务器配置、部署记录和脚本集中放在 `infra/`。

## 启动主页

使用 Node.js 24 LTS，在项目根目录执行：

```bash
cd www
npm ci
npm run dev -- --host 127.0.0.1
```

在 `www/` 内执行 `npm run build` 构建生产版本，执行 `npm run lint` 检查代码。生产文件生成在 `www/dist/`。

## 协作

- 从 `main` 新建功能或修复分支，每个 PR 聚焦一项修改。
- 提交主页修改前运行构建和 lint；界面变更附上截图及检查过的屏幕尺寸。
- 修改目录、命令或部署步骤时，同步更新相应 README。
- 根 `.gitignore` 排除证书、私钥、本地配置、依赖和构建产物。提交前用 `git status` 检查文件清单。

服务器连接配置使用本地 `infra/.local`，结构参考 [infra/.local.example](infra/.local.example)。证书存放约定见 [infra/certs](infra/certs/README.md)。

## 线上地址

- [协会主页](https://www.nkisa.com/)
- [CTF 靶场](https://ctf.nkisa.com/)
- [邮件域名](https://mail.nkisa.com/)：已配置 HTTPS，邮件服务筹备中。
