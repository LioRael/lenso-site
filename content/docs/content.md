---
title: 编写内容
description: 使用文件路由、frontmatter 和 MDX 编写文档。
---

# 编写内容

默认内容目录是 `content/`，支持 `.md` 和 `.mdx`。文件名决定页面 ID 和路由，ID 不包含扩展名，每个路径段可包含字母、数字、下划线和连字符。

| 文件 | 页面 ID | 路由 |
| --- | --- | --- |
| `content/index.mdx` | `index` | `/` |
| `content/guides/install.md` | `guides/install` | `/guides/install/` |
| `content/guides/index.mdx` | `guides/index` | `/guides/` |

不要同时创建映射到同一路由的文件，例如 `guides.md` 和 `guides/index.mdx`。0.3.1 存在已知限制：非根首页和它的子页面同时存在时，子路由可能显示首页内容。例如 `/guides/` 与 `/guides/install/`，或 `/en/` 与 `/en/guides/`。未打补丁的站点可以用 `guides/getting-started.mdx` 和 `guides/content.mdx` 这样的普通页面代替 `guides/index.mdx` 与其子页面的组合；这个站点通过本地补丁修复了该问题。[快速开始](/docs/quickstart/)说明了如何修改默认模板。

## Frontmatter 和标题

```md
---
title: Installation
description: Install the project.
kind: docs
metadata:
  audience: developers
---

# Installation

Install the project before continuing.
```

支持的字段只有 `title`、`description`、`draft`、`kind` 和 `metadata`。`kind` 可以是 `docs`、`component` 或 `api`，默认是 `docs`；`metadata` 必须是 JSON 兼容的对象。`draft: true` 的页面不参与路由、搜索、源文件导出和 sitemap，也不能出现在显式导航中。

页面开头的 H1 可以提供标题。若同时写了 frontmatter 标题，两者必须一致；界面只显示一次标题。没有标题时，框架使用文件名。

## MDX 和内置组件

使用 `.mdx` 来编写 JSX 或导入本地 React 组件。默认组件包括 `Callout`、`Card`、`Cards`、`Tabs`、`Tab`、`Steps` 和 `Step`。例如：

```mdx
<Tabs items={["Bun", "npm"]}>
  <Tab value="Bun">Use Bun.</Tab>
  <Tab value="npm">Use npm.</Tab>
</Tabs>

<Steps>
  <Step>
    ### Install

    Install the dependencies.
  </Step>
</Steps>
```

`Step` 的标题写在子内容中，不使用 `title` 属性。代码围栏支持语法高亮，表格支持横向滚动。`ComponentExample`、`ReferenceTable`、`ApiOperation` 和 `ApiResponses` 是手写参考内容的组件，不会自动生成 API 或发送请求。

可以在 MDX 中用相对路径导入本地组件。静态图片放在 `public/`，例如 `public/logo.svg` 对应 `/logo.svg`。Markdown 内部链接使用不带 `basePath` 的根路径，框架会添加部署前缀；详情见[站点配置](/docs/configuration/)。源码解析规则见上游 [`content.ts`](https://github.com/LioRael/lenso-ui/blob/main/packages/docs/src/content.ts) 和 [MDX 组件](https://github.com/LioRael/lenso-ui/blob/main/packages/docs/src/mdx.tsx)。
