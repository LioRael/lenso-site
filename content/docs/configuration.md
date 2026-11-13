---
title: 站点配置
description: 配置站点信息、导航、部署路径和语言。
---

# 站点配置

在项目根目录创建 `docs.config.ts` 或 `docs.config.mjs`，只能使用其中一个。没有配置文件时，站点标题默认为 `Documentation`，内容目录为 `content`，语言为 `en`，部署路径为 `/`。

```ts
import { defineDocs } from "@lenso/docs";

export default defineDocs({
  title: "My Project",
  description: "Documentation for My Project",
  logo: "/logo.svg",
  siteUrl: "https://example.com",
  basePath: "/manual",
  navigation: [
    { title: "Guide", pages: ["index", "guides/install"] },
  ],
  links: { GitHub: "https://github.com/example/project" },
});
```

示例中的域名、仓库和徽标需要替换为你自己的值，并在 `public/logo.svg` 放置徽标。`siteUrl` 使用部署站点的源地址，`basePath` 单独指定子路径，不能以 `/` 结尾。例如以上配置部署在 `https://example.com/manual/`。内容中的内部链接写成 `/guides/install/`，不要手动加上 `/manual`。

默认导航由目录生成。显式 `navigation` 使用不带扩展名的页面 ID，所有列出的页面都必须存在且不是草稿；未列出的已发布页面仍可访问和搜索。`links` 支持根路径、片段、HTTP(S) 和 `mailto:` 等安全 URL。

## 多语言

下面的例子从两个内容目录生成中文和英文页面：

```ts
import { defineDocs } from "@lenso/docs";

export default defineDocs({
  title: "My Project",
  defaultLocale: "zh",
  locales: [
    { code: "zh", label: "中文", language: "zh-CN", routePrefix: "/", contentDir: "content" },
    { code: "en", label: "English", language: "en", routePrefix: "/en", contentDir: "content-en" },
  ],
});
```

例如 `content/index.md` 对应 `/`，`content-en/index.md` 对应 `/en/`。每种语言分别生成搜索索引和 HTML 语言标记。只设置 `language` 会改变界面和 HTML 语言，不会创建翻译路由。每个语言的内容目录都需要已发布页面；若设置显式 `navigation`，其中列出的 ID 必须在每种语言中存在。

页面有对应翻译时，框架会自动显示语言菜单，默认按相同 slug 匹配页面。自定义 source 适配器可用 `translationKey` 匹配不同 slug 的页面。菜单保留语言路由前缀和 `basePath`；替换桌面或抽屉操作区时，需自行包含 `DocumentationLanguageToggle`，详见[界面定制](/docs/customization/)。

未打补丁的 0.3.1 在 `/en/` 首页和 `/en/.../` 子页面同时存在时，子路由可能显示首页内容。若需要两者共存，需应用等效补丁；也可以移除英文 `index` 页面及其导航引用，只保留英文普通页面，此时 `/en/` 没有首页。这个站点已使用本地补丁，详见[编写内容](/docs/content/)。

其他字段包括 `components`、`root`、`source`、`build`、`aliases`、`styles`、`stylesheet` 和 `trailingSlash`。`source` 用于高级内容适配，`build` 用于 Vite 配置；普通内容站点不需要它们。完整类型和校验规则见上游 [`config.ts`](https://github.com/LioRael/lenso-ui/blob/main/packages/docs/src/config.ts)。
