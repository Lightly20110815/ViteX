# ViteX 一键发帖工具

零依赖。运行后会自动打开浏览器，填表→保存为 markdown→可选自动 git commit & push。

## 启动

```
node tools/post-tool/server.mjs
```

或者双击桌面上的 `ViteX 发帖.bat`（一键启动）。

## 功能

- 选 mood / 填 slug / tags / markdown 正文
- 拖入、点选、Ctrl+V 粘贴图片 → 复制到 `public/uploads/YYYY-MM/`，前端用 `/uploads/...` 引用
- 自动写入 `content/tweets/YYYY/MM/<slug>.md`，格式与现有 tweet 一致
- 勾选 "git commit & push" → 自动 `git add` + `git commit` + `git push`
- 显示最近 25 条 post 列表
- `Ctrl+Enter` 直接提交

## 端口

默认 `5180`。要换端口：

```
$env:POST_TOOL_PORT=5181; node tools/post-tool/server.mjs    # PowerShell
set POST_TOOL_PORT=5181 && node tools/post-tool/server.mjs   # cmd
POST_TOOL_PORT=5181 node tools/post-tool/server.mjs          # bash/zsh
```
