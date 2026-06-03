@echo off
setlocal
title ViteX 发帖工具

cd /d "%~dp0..\.."

where node >nul 2>nul
if errorlevel 1 (
  echo [ViteX] 未找到 Node.js。请先安装 Node.js，或确认 node 已加入 PATH。
  echo.
  pause
  exit /b 1
)

echo [ViteX] 正在启动本地发帖工具...
echo [ViteX] 关闭这个窗口即可停止工具。
echo.
node tools\post-tool\server.mjs

if errorlevel 1 (
  echo.
  echo [ViteX] 发帖工具异常退出。
  pause
)
