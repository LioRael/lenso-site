---
title: 界面定制
description: 注册 MDX 组件、添加样式和定制站点插槽。
---

# 界面定制

普通文档站点无需创建应用入口或 Vite 配置。要注册 MDX 组件，可以在 `docs.config.ts` 中指定项目内模块：

```ts
import { defineDocs } from "@lenso/docs";

export default defineDocs({
  title: "My Project",
  components: "docs-components.tsx",
  styles: ["docs.css"],
});
```

`docs-components.tsx` 可以导出默认组件映射，也可以导出 `getComponents(context)`。下面的例子注册 `ProductNote`，并在站点标识旁添加一个链接：

```tsx
import type { ReactNode } from "react";

export function getComponents() {
  return {
    ProductNote: ({ children }: { children?: ReactNode }) => (
      <aside className="product-note">{children}</aside>
    ),
  };
}

export function getSiteSlots() {
  return { identity: <a href="https://example.com">Project website</a> };
}
```

在 `.mdx` 页面中使用 `<ProductNote>...</ProductNote>`。将链接替换为实际项目地址，并在 `docs.css` 添加样式。例如：

```css
.product-note {
  border: 1px solid currentColor;
  padding: 1rem;
}
```

`getComponents` 和 `getSiteSlots` 接收包含 `config` 与当前 `page` 的上下文。页面信息包括 ID、语言、类型、标题、标题目录、元数据和原始 Markdown。插槽还包括 `headerNavigation`、`desktopActions`、`mobileActions` 和 `drawerFooter`；可查阅上游[站点布局类型](https://github.com/LioRael/lenso-ui/blob/main/packages/docs/src/site-layout.tsx)。

更多钩子包括 `getSiteOptions`、`getPageOptions`、`getRootOptions` 和 `getDocument`。`root` 可以指定独立的根组件模块。钩子可以是异步函数：页面钩子在页面模块加载时求值，`getRootOptions` 在根模块中按语言求值。它们都在服务端渲染和浏览器中执行，因此输出应当确定且代码需要适用于两端。文件系统访问和生成逻辑应放进 `source` 适配器，而不是展示模块。

本地 React 模块中的 StyleX 声明由构建处理。Markdown 图片和配置的 `logo` 会自动加上 `basePath`；自定义 JSX 中的原生资源 URL 需要作者自行处理。配置、MDX 和组件会执行代码，不能用于运行不受信任的输入，也不要在公开内容或元数据中存放密钥。详细接口见上游[定制类型](https://github.com/LioRael/lenso-ui/blob/main/packages/docs/src/customization.ts)和[架构说明](https://github.com/LioRael/lenso-ui/blob/main/packages/docs/ARCHITECTURE.md)。
