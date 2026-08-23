# Lenso documentation

The Lenso public documentation, built with
[Blume](https://useblume.dev). Markdown and MDX under `content/docs` are the
source of truth for readers, search, `llms.txt`, raw Markdown routes, and the
MCP-ready content model.

The documentation tree describes the current Lenso architecture only. Retired product generations
are intentionally excluded from the public site.

## Development

```sh
pnpm dev
```

## Build

```sh
pnpm build
```

## Preview the production build

```sh
pnpm preview
```

The static build is written to `dist/`. `pnpm deploy:dry-run` verifies the
Cloudflare Workers static-assets package without publishing it.

`pnpm check` validates the bilingual docs, all local links, the static
build, AI-readable catalogs, and draft exclusion.

## Structure

- `content/docs`: current Markdown and MDX documentation
- `content/docs/**/meta.ts`: navigation order and group metadata
- `public/lenso-assets`: brand and explanatory assets
- `blume.config.ts`: navigation, search, SEO, and AI-readable output
