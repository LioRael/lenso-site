---
title: Lenso Docs
description: 使用 Markdown 和 MDX 构建 Lenso 文档站点。
---

# Lenso Docs

Lenso Docs 是一个静态文档站点框架。你编写 Markdown 或 MDX、配置站点，`@lenso/docs` 负责生成路由、阅读界面、搜索索引和静态文件。它与 [Lenso CLI](/zh/cli/) 是 Lenso 框架下的并列主题；这里介绍的是 `lenso-docs`，不是 `lenso` 命令。

本文以已发布的 `@lenso/docs` 0.3.1 为准。它提供侧边栏、目录、代码高亮和静态搜索，也支持用 React 组件扩展 MDX。构建结果可以部署到静态托管服务，无需运行文档服务器。

## 使用指南

- [快速开始](/zh/docs/quickstart/)：创建项目并启动开发服务器。
- [编写内容](/zh/docs/content/)：了解文件路由、frontmatter 和 MDX。
- [站点配置](/zh/docs/configuration/)：设置导航、语言和部署路径。
- [界面定制](/zh/docs/customization/)：注册组件、样式和界面插槽。
- [构建与部署](/zh/docs/deployment/)：预览和发布静态输出。

## 使用边界

配置、MDX 和本地组件都是可信项目代码，不是用于执行不受信任内容的沙箱。源 Markdown 和元数据会作为公开构建产物输出，不要在其中存放凭据。框架不内置 OpenAPI 导入、认证请求调试器、远程 CMS、AI 服务或托管服务。

上游 [README](https://github.com/LioRael/lenso-ui/blob/main/packages/docs/README.md) 和[架构说明](https://github.com/LioRael/lenso-ui/blob/main/packages/docs/ARCHITECTURE.md)适合深入阅读。链接指向上游主分支，内容可能比 0.3.1 新；版本行为请以安装包为准。
