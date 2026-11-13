---
title: Writing content
description: Write documentation using file routes, frontmatter, and MDX.
---

# Writing content

The default content directory is `content/`; both `.md` and `.mdx` are supported. File names determine page IDs and routes. IDs omit the extension, and each path segment may contain letters, numbers, underscores, and hyphens.

| File | Page ID | Route |
| --- | --- | --- |
| `content/index.mdx` | `index` | `/` |
| `content/guides/install.md` | `guides/install` | `/guides/install/` |
| `content/guides/index.mdx` | `guides/index` | `/guides/` |

Do not create files that map to the same route, such as `guides.md` and `guides/index.mdx`. Version 0.3.1 has a known limitation: when a non-root index and its descendants coexist, a child route can display the index content. Examples include `/guides/` with `/guides/install/`, or `/en/` with `/en/guides/`. An unpatched site can use ordinary pages such as `guides/getting-started.mdx` and `guides/content.mdx` instead of combining `guides/index.mdx` with its descendants; this site fixes the issue with a local patch. [Quickstart](/en/docs/quickstart/) explains how to adjust the default template.

## Frontmatter and titles

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

The only supported fields are `title`, `description`, `draft`, `kind`, and `metadata`. `kind` can be `docs`, `component`, or `api`, and defaults to `docs`; `metadata` must be a JSON-compatible object. Pages with `draft: true` are excluded from routes, search, source exports, and the sitemap, and cannot appear in explicit navigation.

A leading H1 can provide the title. If frontmatter also specifies a title, the two must match; the interface displays the title once. Without a title, the framework uses the file name.

## MDX and built-in components

Use `.mdx` to write JSX or import local React components. Default components include `Callout`, `Card`, `Cards`, `Tabs`, `Tab`, `Steps`, and `Step`. For example:

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

Write a `Step` heading in its children, not as a `title` prop. Fenced code supports syntax highlighting and tables can scroll horizontally. `ComponentExample`, `ReferenceTable`, `ApiOperation`, and `ApiResponses` are authored reference blocks; they do not generate an API or send requests.

You can import local components into MDX using relative paths. Put static images in `public/`; for example, `public/logo.svg` maps to `/logo.svg`. Use root-relative internal Markdown links without `basePath`; the framework adds the deployment prefix. See [Site configuration](/en/docs/configuration/) for details. For parsing rules, see upstream [`content.ts`](https://github.com/LioRael/lenso-ui/blob/main/packages/docs/src/content.ts) and the [MDX components](https://github.com/LioRael/lenso-ui/blob/main/packages/docs/src/mdx.tsx).
