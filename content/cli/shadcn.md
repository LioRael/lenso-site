---
title: shadcn 扩展
description: 从 shadcn Registry 搜索、预览和添加组件。
---

# shadcn 扩展

shadcn 扩展可以消费官方 Registry、配置的命名空间、明确的 Registry 项 URL 和项目本地 JSON 项。文件、依赖声明、CSS 和环境文件默认值会作为计划供审阅。

## 创建或接入项目

创建新项目：

```sh
lenso new my-web-app --preset shadcn
cd my-web-app
lenso shadcn preview button
lenso shadcn add button
```

对于已有前端项目，使用 `lenso init --preset shadcn`。目标项目需要准备 TypeScript 配置和 Tailwind 4 CSS 入口。

## 搜索和更新

```sh
lenso shadcn search --query button
lenso shadcn list @private --type registry:ui --limit 20
lenso shadcn diff button
lenso shadcn components update button
```

`search` 和 `list` 默认搜索官方目录。`diff` 比较当前 Registry 资源与项目文件，不应用文件或执行进程，但首次准备依赖时仍可能创建锁文件并填充缓存。`components update` 审阅更新计划，并要求处理有差异的文件。

## 命名空间与 monorepo

在活动工作区的 `components.json` 中配置 Registry 命名空间。私有 Registry 的凭据需要项目中的环境变量、目标绑定和 HTTP 授权；不要把凭据放进 URL。扩展不会自动读取 `.env` 或 `.env.local` 作为认证变量。

在 monorepo 中，可以通过 `--cwd` 选择应用工作区：

```sh
lenso shadcn preview @private/dashboard --cwd apps/web
lenso shadcn add button input --cwd apps/web
```

无法确定工作区时，CLI 会请求选择。详细支持范围、认证、依赖安装和限制见[上游 shadcn 文档](https://github.com/LioRael/lenso-cli/blob/main/docs/shadcn.md)。
