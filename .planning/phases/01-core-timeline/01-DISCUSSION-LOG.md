# Phase 1: Core Timeline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-02
**Phase:** 1-core-timeline
**Areas discussed:** Tweet Card Style, Page Layout, Background Treatment, Markdown Rendering Scope

---

## Tweet Card Style

### Round 1: Visual approach

| Option | Description | Selected |
|--------|-------------|----------|
| 极简分隔线 | 纯色背景，推文间细线分隔 | |
| 独立卡片 | 圆角卡片，独立背景色+阴影 | |
| 毛玻璃卡片 | 半透明卡片叠加在 Bing 背景图上 | ✓ |

| Option | Description | Selected |
|--------|-------------|----------|
| 顶栏在上，正文在下 | 用户名/心情/时间一行，正文下方 | ✓ |
| 心情 emoji 独立左侧 | emoji 放大在左侧，顶栏正文在右侧 | |

| Option | Description | Selected |
|--------|-------------|----------|
| 适中宽度 | desktop max-width ~600px | ✓ |
| 宽屏撑满 | 内容撑满可用宽度 | |
| 窄条 | ~480px | |

| Option | Description | Selected |
|--------|-------------|----------|
| 微妙高亮 | 背景色稍微变化 | ✓ |
| 无效果 | 纯静态 | |
| 阴影增强 | 悬停时阴影加深 | |

### Round 2: Detail refinements

| Option | Description | Selected |
|--------|-------------|----------|
| 轻微模糊 | 小 backdrop-blur，性能友好 | ✓ |
| 明显模糊 | 中等 blur | |
| 重度毛玻璃 | 高 blur + 强半透明 | |

| Option | Description | Selected |
|--------|-------------|----------|
| 小圆角 | 6-8px | |
| 中等圆角 | 12-16px | ✓ |
| 大圆角 | 20-24px | |

| Option | Description | Selected |
|--------|-------------|----------|
| 适中 | 16-20px | ✓ |
| 紧密 | 8-12px | |
| 宽松 | 24-32px | |

| Option | Description | Selected |
|--------|-------------|----------|
| 不需要 | 间距够区分 | |
| 细线 | 1px 半透明分隔线 | ✓ |

---

## Page Layout

### Round 1: Structure

| Option | Description | Selected |
|--------|-------------|----------|
| 单列居中 | 简介顶部+时间线下方 | |
| 侧边栏+内容 | 左侧固定信息+右侧时间线 | ✓ |
| 双列时间线 | 瀑布流多列 | |

| Option | Description | Selected |
|--------|-------------|----------|
| 页面顶部 | 作为 header 第一眼看到 | ✓ |
| 固定在侧边 | desktop sticky 侧边栏 | |

| Option | Description | Selected |
|--------|-------------|----------|
| 单列堆叠 | 简介上+时间线下，自适应 | ✓ |
| 个人简介可折叠 | 顶部精简版，点击展开 | |

| Option | Description | Selected |
|--------|-------------|----------|
| 672px | 标准可读宽度 | ✓ |
| 768px | 稍宽 | |
| 全宽 | 撑满视口 | |

**User's note:** 顶部区域 = 页面顶部有个人简介 + 下方侧边栏（导航链接）+ 时间线主体

### Round 2: Sidebar and navigation

| Option | Description | Selected |
|--------|-------------|----------|
| 迷你个人简介 | 头像+用户名+一句话 | |
| 导航链接 | 外部链接、社交链接 | ✓ |
| 空侧边栏 | 不需要侧边栏 | |

| Option | Description | Selected |
|--------|-------------|----------|
| 不需要 | 纯时间线页面 | ✓ |
| 固定顶栏 | 始终在顶部 | |

| Option | Description | Selected |
|--------|-------------|----------|
| 紧凑版 | 头像+简短 bio，背景缩小 | ✓ |
| 和桌面端一样 | 完整显示 | |

| Option | Description | Selected |
|--------|-------------|----------|
| 极简 | Powered by ViteX · 年份 | ✓ |
| 不需要 | 没有 footer | |

---

## Background Treatment

| Option | Description | Selected |
|--------|-------------|----------|
| 全页背景 | 整个页面背后显示 Bing 图 | ✓ |
| 仅顶部区域 | 只在个人简介区域 | |

| Option | Description | Selected |
|--------|-------------|----------|
| 适度虚化 | 色彩氛围可见但细节柔化 | ✓ |
| 强虚化 | 高度模糊 | |
| 不虚化 | 原图清晰 | |

| Option | Description | Selected |
|--------|-------------|----------|
| Custom | 浅色模式浅色遮罩，深色模式深色遮罩 — 同一张图不同叠加层 | ✓ |

| Option | Description | Selected |
|--------|-------------|----------|
| 纯色渐变占位 | 渐变色占位，加载后平滑过渡 | ✓ |
| 直接从白色过渡 | 先白底，图片好了切换 | |

---

## Markdown Rendering Scope

| Option | Description | Selected |
|--------|-------------|----------|
| 加粗/斜体 | `**bold**` `*italic*` | ✓ |
| 链接 | `[text](url)` | ✓ |
| 删除线 | `~~strikethrough~~` | ✓ |
| 行内代码 | `` `code` `` | ✓ |

| Option | Description | Selected |
|--------|-------------|----------|
| 支持围栏代码块 | ` ``` ` + 语法高亮 | ✓ |
| 不带高亮 | 只渲染无高亮 | |
| 暂不支持 | 保留原始文本 | |

| Option | Description | Selected |
|--------|-------------|----------|
| 支持 | `![图片](url)` 可点击查看 | ✓ |
| 暂不支持 | 只渲染文字 | |

| Option | Description | Selected |
|--------|-------------|----------|
| 仅安全 HTML | 禁止 script/iframe | ✓ |
| 纯 Markdown | 完全禁止 HTML | |

---

## Claude's Discretion

None — user explicitly made all design decisions.

## Deferred Ideas

None — discussion stayed within phase scope.
