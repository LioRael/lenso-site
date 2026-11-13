---
title: 快速开始
description: 创建 Lenso Docs 0.3.1 项目并在本地运行。
---

# 快速开始

准备 Bun 1.4.4 或更新版本，以及 Node.js 22.12 或更新版本。下面的命令固定使用 0.3.1 初始化器，它创建的项目依赖 `@lenso/docs` 0.3.1：

```sh
bunx create-lenso-docs@0.3.1 my-docs
cd my-docs
bun install
bun run dev
```

初始化器只创建文件，不会安装依赖。开发服务器默认监听 `127.0.0.1:3000`。用浏览器打开该地址，编辑 `content/index.mdx`，保存后查看更新。

生成的项目包含 `docs.config.ts`、`content/`、示例组件和 `public/`。项目脚本调用 `lenso-docs dev`、`build` 和 `preview`。需要改变开发服务器监听地址或端口时，可以运行：

```sh
bun run dev --host 127.0.0.1 --port 3001
```

## 修正模板的嵌套路由

0.3.1 的默认模板同时包含 `content/guides/index.mdx` 和 `content/guides/content.mdx`。虽然构建可能成功，`/guides/content/` 却会显示 `/guides/` 的内容。可以将目录首页改为普通页面：

```sh
mv content/guides/index.mdx content/guides/getting-started.mdx
```

然后在 `docs.config.ts` 的 `navigation` 中将 `guides/index` 改为 `guides/getting-started`；在 `content/guides/content.mdx` 中将链接 `/guides/` 改为 `/guides/getting-started/`，并更新 `content/index.mdx` 中列出的文件和 URL。这样两个页面分别使用 `/guides/getting-started/` 和 `/guides/content/`。也可以应用本网站使用的本地补丁。更多限制见[编写内容](/docs/content/)。

要生成并预览发布版本：

```sh
bun run build
bun run preview
```

构建输出在 `out/`，预览默认使用端口 4173。`.lenso/` 是生成目录，不要把手写内容放进去。

在项目中运行 `bun pm ls` 可查看已安装的 `@lenso/docs` 版本。0.3.1 的 `bun x lenso-docs --version` 因 CLI 中的硬编码仍输出 `0.2.0`，不要用该输出判断包版本。

接下来阅读[编写内容](/docs/content/)和[站点配置](/docs/configuration/)。初始化器的用法也可参阅[上游源码](https://github.com/LioRael/lenso-ui/tree/main/packages/create-docs)。
