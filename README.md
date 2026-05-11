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
- **分享卡片导出** — Canvas 渲染 1080p 长图，支持下载 PNG 和系统分享
- **RSS 订阅** — 构建时自动生成 rss.xml
- **音乐播放器** — APlayer + Meting API，支持网易云/QQ音乐/酷狗

## 快速开始

```bash
pnpm install
pnpm dev
```

访问 `http://localhost:3000`。

## 撰写推文

在 `content/tweets/YYYY/MM/` 下创建 `.md` 文件：

```markdown
---
mood: 😊
created: 2026-05-02T12:00:00+08:00
images:
  - https://example.com/photo.jpg
tags:
  - coding
  - life
---

# Hello, ViteX!

这是我的第一条推文。**ViteX** 是一个 Markdown 驱动的个人时间线。

## 功能

- Markdown 写作
- 毛玻璃设计

> 写 Markdown，推送到 Git，时间线就上线了。
```

### Frontmatter 字段

| 字段      | 类型       | 说明                           |
| --------- | ---------- | ------------------------------ |
| `mood`    | `string`   | 心情表情（如 `😊`）            |
| `created` | `string`   | ISO 8601 创建时间              |
| `images`  | `string[]` | 可选，推文配图 URL 列表        |
| `tags`    | `string[]` | 可选，标签列表，支持按标签筛选 |

## 部署

连接 GitHub 仓库到 Vercel，每次推送自动部署。构建命令：`pnpm build`，输出目录：`dist`。

## 项目结构

```
vitex/
├── content/tweets/          # 推文 Markdown 文件（YYYY/MM/*.md）
├── src/
│   ├── main.ts              # 入口：渲染编排与交互初始化
│   ├── main-variant.ts       # 简化版入口（无特效）
│   ├── styles.css            # Apple Frosted Glass 全局样式
│   ├── build/                # Vite 构建插件
│   │   ├── markdown-plugin.ts # Markdown → JS 模块转换
│   │   └── rss-plugin.ts     # RSS 生成
│   ├── config/
│   │   └── site.ts           # 站点统一配置（URL、标题、描述、语言）
│   ├── data/
│   │   ├── profile.ts        # 用户资料（avatar、bio、HRT 阶段）
│   │   ├── tweets.ts         # 构建时推文收集与排序
│   │   └── music-config.ts   # 音乐播放器配置
│   ├── components/
│   │   ├── Profile.ts        # 侧边栏资料渲染
│   │   ├── TweetCard.ts      # 推文卡片 DOM 工厂
│   │   ├── Timeline.ts       # 时间线容器 + 标签筛选
│   │   ├── TagFilter.ts      # 标签云筛选组件
│   │   ├── MoodStats.ts      # 情绪分布统计
│   │   ├── HRTTimeline.ts    # HRT 阶段时间线
│   │   ├── MusicPlayer.ts    # 音乐播放器（APlayer + Meting）
│   │   ├── Lightbox.ts       # 图片灯箱
│   │   ├── Cursor.ts         # 自定义光标
│   │   ├── TrailingCursor.ts # 鼠标拖尾粒子
│   │   ├── CanvasParticles.ts # Canvas 粒子网络
│   │   ├── ShareCard.ts      # 分享卡片（re-export）
│   │   └── share-card/       # 分享卡片模块
│   │       ├── index.ts      # openShareCard 公开 API
│   │       ├── dialog.ts     # 弹窗交互逻辑
│   │       ├── renderer.ts   # Canvas 渲染引擎
│   │       ├── theme.ts      # 主题与布局常量
│   │       └── utils.ts      # 文本/图片/导出工具
│   ├── utils/
│   │   ├── marked-config.ts  # Marked 解析器 + highlight.js + XSS 过滤
│   │   └── time.ts           # 相对时间格式化（dayjs）
│   └── types/
│       ├── TweetData.ts      # TweetData / TweetMeta 接口
│       ├── aplayer.d.ts      # APlayer 类型声明
│       └── markdown.d.ts     # Markdown 模块类型声明
├── public/                   # 静态资源（variants, designs, logo）
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 技术栈

| 层级     | 技术选型                        |
| -------- | ------------------------------- |
| 构建工具 | Vite 8                          |
| 开发语言 | TypeScript 5.8                  |
| Markdown | marked + gray-matter            |
| 样式     | 自定义 CSS（毛玻璃 + 系统主题） |
| 代码高亮 | highlight.js                    |
| 时间处理 | dayjs                           |
| 音乐播放 | APlayer + Meting API            |
| 部署平台 | Vercel                          |

## 命令

| 命令                | 操作                 |
| ------------------- | -------------------- |
| `pnpm dev`          | 启动 Vite 开发服务器 |
| `pnpm build`        | 生产环境构建         |
| `pnpm preview`      | 预览生产构建         |
| `pnpm format`       | 格式化所有源文件     |
| `pnpm format:check` | 检查代码格式         |
| `pnpm typecheck`    | TypeScript 类型检查  |

## 开源协议

MIT · © Sy
