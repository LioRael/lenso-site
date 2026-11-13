# Lenso 文档站

这个站点使用 [Lenso Docs](https://github.com/LioRael/lenso-ui/tree/main/packages/docs) 构建。
站点按项目组织内容，目前包含 Lenso CLI 和 Lenso Docs 两个主题。
CLI 内容以 [lenso-cli](https://github.com/LioRael/lenso-cli) 为依据，编写时参考的源码版本为
`f085b81b977a38b821f4747239694c89458df3fa`。Docs 内容以 `@lenso/docs` 0.3.1 为依据。
项目发布新版本时，应对照上游更新相应主题。

需要 Bun 1.4.4 或更新版本，以及 Node.js 22.12 或更新版本。

```sh
bun install --frozen-lockfile
bun run dev
```

使用 `bun run build` 生成静态站点到 `out/`，使用 `bun run preview` 本地预览构建结果。
`bun run test` 会先构建，再检查中英文文档页面、语言菜单和主题导航。
中文内容在 `content/`，英文内容在 `content-en/`；两种语言使用相同的文件名，
以便语言切换跳转到对应页面。每种语言下的 `cli/` 和 `docs/` 分别存放对应主题。
更新页面时请同时检查两个版本以及 `docs-components.tsx` 中的主题导航。
`docs.config.ts` 配置语言与站点，`.lenso/`、`out/` 是生成目录。
`patches/` 中的 Bun 补丁修正 @lenso/docs 0.3.1 对同时包含首页和子页面的路由生成；
升级框架后请验证该问题是否已修复，再决定是否移除补丁。
部署时将 `out/` 发布到支持目录索引和 `404.html` 的静态托管服务。
