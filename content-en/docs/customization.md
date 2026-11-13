---
title: Customization
description: Register MDX components, add styles, and customize site slots.
---

# Customization

An ordinary documentation site does not need its own application entry point or Vite configuration. To register MDX components, specify a project-local module in `docs.config.ts`:

```ts
import { defineDocs } from "@lenso/docs";

export default defineDocs({
  title: "My Project",
  components: "docs-components.tsx",
  styles: ["docs.css"],
});
```

`docs-components.tsx` can export a default component map or `getComponents(context)`. This example registers `ProductNote` and adds a link beside the site identity:

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

Use `<ProductNote>...</ProductNote>` in an `.mdx` page. Replace the link with your project address and add styles in `docs.css`. For example:

```css
.product-note {
  border: 1px solid currentColor;
  padding: 1rem;
}
```

`getComponents` and `getSiteSlots` receive a context containing `config` and the current `page`. Page information includes its ID, locale, kind, title, headings, metadata, and original Markdown. Other slots include `headerNavigation`, `desktopActions`, `mobileActions`, and `drawerFooter`; see the upstream [site layout types](https://github.com/LioRael/lenso-ui/blob/main/packages/docs/src/site-layout.tsx).

Other hooks include `getSiteOptions`, `getPageOptions`, `getRootOptions`, and `getDocument`. `root` can specify a separate root component module. Hooks may be async: page hooks are evaluated when the page module loads, while `getRootOptions` is evaluated per locale in the root module. They run both during server rendering and in the browser, so their output should be deterministic and their code must work in both environments. Put filesystem access and generation in a `source` adapter, not a presentation module.

The build processes StyleX declarations in local React modules. Markdown images and the configured `logo` receive `basePath` automatically; native asset URLs in custom JSX are the author's responsibility. Configuration, MDX, and components execute code, so do not use them to run untrusted input or store secrets in public content or metadata. For the complete interfaces, see upstream [customization types](https://github.com/LioRael/lenso-ui/blob/main/packages/docs/src/customization.ts) and [architecture notes](https://github.com/LioRael/lenso-ui/blob/main/packages/docs/ARCHITECTURE.md).
