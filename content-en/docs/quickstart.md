---
title: Quickstart
description: Create and run a Lenso Docs 0.3.1 project locally.
---

# Quickstart

Install Bun 1.4.4 or later and Node.js 22.12 or later. The following command pins the initializer to 0.3.1; its generated project depends on `@lenso/docs` 0.3.1:

```sh
bunx create-lenso-docs@0.3.1 my-docs
cd my-docs
bun install
bun run dev
```

The initializer creates files but does not install dependencies. The development server listens on `127.0.0.1:3000` by default. Open that address in a browser, edit `content/index.mdx`, and save to see the update.

The generated project includes `docs.config.ts`, `content/`, example components, and `public/`. Its scripts call `lenso-docs dev`, `build`, and `preview`. To change the development server's bind address or port:

```sh
bun run dev --host 127.0.0.1 --port 3001
```

## Correct the template's nested routes

The 0.3.1 default template contains both `content/guides/index.mdx` and `content/guides/content.mdx`. Although the build can succeed, `/guides/content/` displays the content of `/guides/`. To turn the directory index into an ordinary page:

```sh
mv content/guides/index.mdx content/guides/getting-started.mdx
```

Then change `guides/index` to `guides/getting-started` in the `navigation` in `docs.config.ts`; change the `/guides/` link in `content/guides/content.mdx` to `/guides/getting-started/`, and update the file and URL listed in `content/index.mdx`. The pages will then use `/guides/getting-started/` and `/guides/content/` respectively. Alternatively, apply the local patch used by this site. See [Writing content](/en/docs/content/) for more about the limitation.

To build and preview the release output:

```sh
bun run build
bun run preview
```

The build writes to `out/`; preview uses port 4173 by default. `.lenso/` is generated, so do not put authored content there.

Run `bun pm ls` in the project to check the installed `@lenso/docs` version. In 0.3.1, `bun x lenso-docs --version` still reports `0.2.0` because the value is hard-coded in the CLI; do not use it to determine the package version.

Continue with [Writing content](/en/docs/content/) and [Site configuration](/en/docs/configuration/). The initializer's usage is also documented in the [upstream source](https://github.com/LioRael/lenso-ui/tree/main/packages/create-docs).
