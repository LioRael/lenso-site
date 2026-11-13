---
title: 构建与部署
description: 构建、预览并部署静态文档站点。
---

# 构建与部署

在项目根目录运行：

```sh
bun run build
bun run preview
```

`build` 将已发布页面预渲染到 `out/`，包含 HTML、客户端资源、字体、搜索索引、原始 Markdown 和 `404.html`。`preview` 从该输出提供站点，默认监听 `127.0.0.1:4173`，可用 `--host` 和 `--port` 调整。预览支持深层链接和真实的 404 状态码。搜索按需加载，不需要账户或运行时服务。

将 `out/` 的内容上传到静态托管服务。默认输出使用目录索引，托管服务需要能为目录提供 `index.html`，并对缺失页面使用 `404.html`。若设置 `basePath: "/manual"`，将输出挂载在 `/manual` 下。配置 `siteUrl` 后，构建还会生成 canonical、语言备用链接、sitemap 和 robots 信息。

如果托管服务更适合 `.html` 文件，可以设置 `trailingSlash: false`，构建改用 `.html` 导出。请按托管服务的规则检查链接、目录索引和 404 行为，不要依赖单页应用回退来伪装所有缺失页面。

## 构建目录和安全

`.lenso/dev/` 和 `.lenso/build/` 分别用于开发和生产；`out/` 是生成的发布目录。框架不会覆盖非空且不属于它的目录。保留手写文件在内容目录、`public/` 和配置文件中，不要放进生成目录。

内容和 `public/` 中不支持符号链接。`public/` 不能覆盖文档路由或框架保留的资源，包括 `_lenso`、`_next`、`assets` 和生成的 `404.html`；启用 `siteUrl` 时也不能覆盖生成的 `sitemap.xml` 和 `robots.txt`。

构建会执行可信的配置、MDX 和组件代码。只构建你信任的项目，并在发布前检查输出：原始 Markdown 和元数据不是秘密存储。更多实现细节见上游[构建运行时](https://github.com/LioRael/lenso-ui/blob/main/packages/docs/src/runtime.ts)和[架构说明](https://github.com/LioRael/lenso-ui/blob/main/packages/docs/ARCHITECTURE.md)。
