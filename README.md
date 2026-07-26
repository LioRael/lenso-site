# Lenso documentation

The Lenso homepage and public documentation, built with
[Blume](https://useblume.dev). Markdown and MDX under `content/docs` are the
source of truth for readers, search, `llms.txt`, raw Markdown routes, and the
MCP-ready content model.

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

## Structure

- `pages/index.astro`: custom Lenso homepage
- `content/docs`: public Markdown and MDX documentation
- `content/docs/**/meta.ts`: navigation order and group metadata
- `openapi/app-api.v1.yaml`: committed public API reference input
- `public/lenso-assets`: brand and explanatory assets
- `blume.config.ts`: navigation, search, SEO, AI-readable output, and API reference
