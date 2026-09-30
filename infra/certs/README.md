# 本地证书材料

证书及私钥统一保存在以下目录，由根 `.gitignore` 排除：

| 目录 | 证书 | 私钥 |
| --- | --- | --- |
| `www/` | `nkisa.com.pem` | `nkisa.com.key` |
| `ctf/` | `ctf.nkisa.com.pem` | `ctf.nkisa.com.key` |
| `mail/` | `mail.nkisa.com.pem` | `mail.nkisa.com.key` |

本机保留这些文件；从 GitHub 获取项目时，需要由运维负责人另行提供安装所需材料。证书子目录权限为 `0700`，私钥权限为 `0600`。

安装时将所需文件复制到独立的私有暂存目录。安装成功后清理暂存私钥，并保留本目录中的原件。
