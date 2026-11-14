# Lenso Documentation

This site is built with [Lenso Docs](https://github.com/LioRael/lenso-ui/tree/main/packages/docs).
Its content is organized by project and currently covers Lenso CLI and Lenso Docs.
The CLI documentation is based on [lenso-cli](https://github.com/LioRael/lenso-cli) at commit
`f085b81b977a38b821f4747239694c89458df3fa`. The Docs content is based on `@lenso/docs` 0.3.1.
Update the corresponding documentation against upstream when a project releases a new version.

## Development

Requirements: Bun 1.4.4 or later and Node.js 22.12 or later.

```sh
bun install --frozen-lockfile
bun run dev
```

Run `bun run build` to generate the static site in `out/`, and `bun run preview` to preview it locally.
`bun run test` builds the site and checks the Chinese and English pages, language menu, and project navigation.

## Content and configuration

Chinese content lives in `content/` and English content in `content-en/`. English is served at the root, and Chinese at `/zh/`. Both languages use matching filenames so the language switcher can open the corresponding page. Within each language, `cli/` and `docs/` hold their respective topics.

When updating a page, check both language versions and the project navigation in `docs-components.tsx`.
`docs.config.ts` configures the site and its languages. `.lenso/` and `out/` are generated directories.

The Bun patch in `patches/` fixes route generation in `@lenso/docs` 0.3.1 for sites with both a home page and child pages. After upgrading the framework, verify whether the issue is fixed before removing the patch.

## Deployment

Publish `out/` to a static host that supports directory indexes and `404.html`.
The build also generates a Cloudflare Pages `_redirects` file for the previous `/en/` URLs.
