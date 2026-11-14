---
title: Site configuration
description: Configure site information, navigation, deployment paths, and languages.
---

# Site configuration

Create either `docs.config.ts` or `docs.config.mjs` in the project root, but not both. Without a configuration file, the site title defaults to `Documentation`, the content directory to `content`, the language to `en`, and the deployment path to `/`.

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

Replace the example domain, repository, and logo with your own values, and put the logo at `public/logo.svg`. Use the deployment origin for `siteUrl` and specify the subpath separately with `basePath`, without a trailing `/`. For example, the configuration above deploys at `https://example.com/manual/`. Write an internal content link as `/guides/install/`, without adding `/manual` yourself.

Default navigation comes from directories. Explicit `navigation` uses page IDs without extensions; every listed page must exist and not be a draft. Published pages omitted from navigation remain accessible and searchable. `links` accepts safe URLs including root-relative paths, fragments, HTTP(S), and `mailto:`.

## Multiple languages

This example generates Chinese and English pages from two content directories:

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

For example, `content/index.md` maps to `/` and `content-en/index.md` maps to `/en/`. Each language gets its own search index and HTML language attribute. Setting `language` alone localizes the interface and HTML language but does not create translated routes. Each locale's content directory needs published pages; if you set explicit `navigation`, every listed ID must exist in each language.

The framework displays a language menu when a page has translations, matching pages by slug by default. Custom source adapters can use `translationKey` to match pages with different slugs. The menu preserves locale prefixes and `basePath`; if you replace the desktop or drawer actions, include `DocumentationLanguageToggle` yourself. See [Customization](/docs/customization/).

In unpatched 0.3.1, when the `/en/` index and `/en/.../` descendants coexist, a child route can display the index content. Apply an equivalent patch if you need both; alternatively, remove the English `index` page and its navigation reference and keep ordinary English pages, leaving `/en/` without a home page. This site uses a local patch. See [Writing content](/docs/content/).

Other fields include `components`, `root`, `source`, `build`, `aliases`, `styles`, `stylesheet`, and `trailingSlash`. `source` is for advanced content adapters and `build` supplies Vite configuration; an ordinary content site does not need either. For complete types and validation rules, see upstream [`config.ts`](https://github.com/LioRael/lenso-ui/blob/main/packages/docs/src/config.ts).
