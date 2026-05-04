# ViteX

> 个人时间线 · Markdown 驱动 · 纯前端静态站点

![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)

## 在线演示

**https://vite-x.vercel.app**

## 功能特性

- **Markdown 驱动** — 写推文就是写 `.md` 文件，推送到 Git，时间线自动更新
- **毛玻璃 UI** — Apple Frosted Glass 风格，卡片和侧边栏均有磨砂玻璃效果
- **必应每日壁纸** — 每日更新的精美背景图
- **自动深色/浅色模式** — 跟随系统偏好自动切换
- **3D 卡片交互** — 鼠标悬停时卡片带有透视变换和跟随光效
- **代码高亮** — 支持 highlight.js 代码块语法高亮
- **构建时渲染** — 自定义 Vite 插件在构建时预渲染所有推文
- **纯原生 TS** — 无框架，使用 TypeScript DOM 工厂函数
- **响应式布局** — 适配桌面端和移动端

## 快速开始

```bash
pnpm install
pnpm dev
```

访问 `http://localhost:5173`。

## 撰写推文

在 `content/tweets/YYYY/MM/` 下创建 `.md` 文件：

```markdown
---
mood: 😊
created: 2026-05-02T12:00:00+08:00
---

# Hello, ViteX!

这是我的第一条推文。**ViteX** 是一个 Markdown 驱动的个人时间线。

## 功能

- Markdown 写作
- 毛玻璃设计

> 写 Markdown，推送到 Git，时间线就上线了。
```

### Frontmatter 字段

| 字段      | 类型     | 说明                  |
|---------|----------|---------------------|
| `mood`  | `string` | 心情表情（如 `😊`）      |
| `created` | `string` | ISO 8601 创建时间      |

## 部署

### Vercel（推荐）

```bash
pnpm deploy
```

或连接 GitHub 仓库到 Vercel，每次推送自动部署。

## 项目结构

```
vitex/
├── content/tweets/     # 推文 Markdown 文件（YYYY/MM/*.md）
├── src/
│   ├── main.ts        # 入口函数，渲染与交互逻辑
│   ├── data/
│   │   ├── profile.ts  # 用户资料数据
│   │   └── tweets.ts   # 构建时推文数据
│   ├── components/
│   │   ├── Profile.ts  # 侧边栏资料渲染器
│   │   ├── TweetCard.ts # 推文卡片渲染器
│   │   └── Timeline.ts  # 时间线容器渲染器
│   ├── utils/
│   │   ├── marked-config.ts # Markdown 解析器配置
│   │   └── time.ts      # 时间格式化工具
│   ├── types/
│   │   ├── TweetData.ts
│   │   └── markdown.d.ts
│   └── styles.css      # Apple Frosted Glass 样式
├── index.html
├── package.json
└── vite.config.ts
```

## 技术栈

| 层级      | 技术选型              |
|---------|-------------------|
| 构建工具   | Vite 8            |
| 开发语言   | TypeScript 5.8    |
| Markdown | marked + gray-matter |
| 样式     | Pico.css + 自定义 CSS |
| 代码高亮   | highlight.js     |
| 时间处理   | dayjs             |
| 部署平台   | Vercel            |

## 命令

| 命令              | 操作              |
|-----------------|-----------------|
| `pnpm dev`      | 启动 Vite 开发服务器 |
| `pnpm build`    | 生产环境构建        |
| `pnpm preview`  | 预览生产构建        |
| `pnpm deploy`   | 构建并推送到 Vercel  |

## 开源协议

MIT · © Sy
