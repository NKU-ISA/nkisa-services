# NKISA 协会主页

南开大学信息安全协会主页。React + TypeScript + Vite + Motion，原生 Canvas 绘制主视觉，未引入额外的 3D 库。

## 开发与构建

建议使用 Node.js 24 LTS。主页项目直接位于 `www/`，在本目录执行：

```bash
npm ci
npm run dev -- --host 127.0.0.1
```

- 本地预览：Vite 启动时输出的地址，默认 `http://127.0.0.1:5173/`。
- 生产构建：`npm run build`，输出到 `dist/`。
- 构建预览：`npm run preview`。
- 静态检查：`npm run lint`。

## 线上部署

线上地址：[www.nkisa.com](https://www.nkisa.com/)。生产构建输出到本目录的 `dist/`；打包、发布和回退见 [www 部署说明](../infra/deploy/www/README.md)，当前服务器配置见 [Nginx 归档](../infra/nginx/README.md)。

滚动文字带使用 SVG 八角星，避免 iOS 将装饰字符显示为 emoji。

## 页面与交互

- **首屏**：原始协会 Logo、旋转线框球体、三组粒子轨道、鼠标视差、分层滚动视差及文字入场。
- **协会介绍**：固定侧栏、跟随滚动旋转的图形、逐行点亮的理念文字。
- **探索方向**：WEB / PWN / REVERSE / CRYPTO 可切换面板，展示各方向的示例与学习内容；支持方向键、Home、End。
- **入门挑战**：本地交互终端，支持 `help`、`ls`、`whoami`、`cat welcome.txt`、`cat first_flag.b64`、`decode`、`submit <flag>`、`clear`。上下方向键调用输入历史。只解析预设命令，输入不会作为代码执行。
- **导航**：章节高亮、顶部阅读进度、移动端展开菜单、原生锚点和返回顶部。
- **CTF**：保留 `https://ctf.nkisa.com`，新标签页打开。

## 文件结构

| 文件 | 用途 |
| --- | --- |
| `src/App.tsx` | 页面组合与全局动效设置 |
| `src/components/site-header.tsx` | 响应式导航、动效开关、阅读进度 |
| `src/components/hero-section.tsx` | 首屏内容与滚动视差 |
| `src/components/hero-visual.tsx` / `.css` | Canvas 球体、轨道、Logo 和指针交互 |
| `src/components/about-section.tsx` | 协会介绍、滚动文字、文字带、通用入场组件 |
| `src/components/explore-section.tsx` / `.css` | 技术方向与对应终端示例 |
| `src/components/practice-section.tsx` | Base64 入门挑战 |
| `src/components/site-footer.tsx` | 结尾引导与品牌展示 |
| `src/hooks/use-hero-motion.ts` | 系统动效偏好与全局暂停上下文 |
| `src/index.css` | 主题、页面布局及响应式样式 |

品牌 SVG 来自 `src/assets/brand/nkisa-logo-white.svg`，保留原始几何。配色以南开紫 `#711a5f` 为基础：主按钮直接使用该品牌原色和白色文字，搭配同色系柔和外发光，悬停时增强；环境辉光使用品牌紫，强调文字、轨道和粒子使用提亮紫 `#d89acd`，页面背景为紫黑色 `#100c12`。颜色与文字层次集中定义在 `src/index.css` 的 `:root`，局部 CSS 引用这些变量；Canvas 的对应 RGB 常量位于 `hero-visual.tsx` 的 `ORBIT_COLOR`。

页面文案使用中性表达，英文协会标识统一为 `NKU INFOSEC ASSOCIATION`。

## 动效与可访问性

- 首屏 Canvas 使用投影几何，设备像素比上限 1.75。
- Canvas 离开视口、页面进入后台或用户暂停时停止逐帧绘制；卸载时清理监听和 ResizeObserver。
- 导航中的暂停按钮控制全页动效，同时保留链接、切换面板和终端功能。
- 遵循 `prefers-reduced-motion`；系统要求减少动效时展示静态主视觉，禁用开关并说明原因。
- 保留跳至正文、键盘焦点、明确的按钮名称，以及 tab / tabpanel 语义。
- 终端最多保留 12 条输出和 50 条输入历史；日志使用稳定 ID。

## 本次验证（2026-09-29）

- TypeScript、Vite 生产构建及 Oxlint 通过。
- 浏览器检查 320 / 390 / 768 / 1024 / 1440px 宽度，页面无横向溢出。
- 实际验证锚点导航、移动端菜单、技术方向切换、Home / End 键、动效暂停和恢复。
- 实际完成终端的帮助、解码、flag 提交、历史输入与清空流程。
- 系统减少动态效果分支经过代码审阅；未更改用户的系统设置。

后续协会活动、加入方式、成员和成果等内容可在获得真实资料后继续补充。
