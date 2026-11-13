---
title: Build and deployment
description: Build, preview, and deploy a static documentation site.
---

# Build and deployment

Run these commands in the project root:

```sh
bun run build
bun run preview
```

`build` prerenders published pages into `out/`, including HTML, client assets, fonts, search indexes, original Markdown, and `404.html`. `preview` serves that output on `127.0.0.1:4173` by default; use `--host` and `--port` to change it. Preview supports deep links and real 404 status codes. Search loads on demand and needs no account or runtime service.

Upload the contents of `out/` to a static host. By default the output uses directory indexes, so the host must serve `index.html` for directories and use `404.html` for missing pages. With `basePath: "/manual"`, mount the output under `/manual`. Setting `siteUrl` also enables canonical and language alternate links, a sitemap, and robots information.

If your host is better suited to `.html` files, set `trailingSlash: false` to export `.html` files instead. Check links, directory indexes, and 404 behavior against the host's rules; do not rely on a single-page application fallback to disguise missing pages.

## Build directories and security

`.lenso/dev/` and `.lenso/build/` are separate development and production directories; `out/` is the generated release directory. The framework does not overwrite nonempty directories it does not own. Keep authored files in the content directory, `public/`, and configuration files rather than generated directories.

Symlinks are unsupported in content and `public/`. `public/` cannot override document routes or reserved framework assets, including `_lenso`, `_next`, `assets`, and the generated `404.html`. When `siteUrl` is set it also cannot override the generated `sitemap.xml` and `robots.txt`.

Builds execute trusted configuration, MDX, and component code. Build only projects you trust and inspect the output before publishing: original Markdown and metadata are not secret storage. For implementation details, see the upstream [build runtime](https://github.com/LioRael/lenso-ui/blob/main/packages/docs/src/runtime.ts) and [architecture notes](https://github.com/LioRael/lenso-ui/blob/main/packages/docs/ARCHITECTURE.md).
