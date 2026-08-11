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

## Synchronize the API reference

The framework contract is authoritative. Do not edit the English or Chinese
OpenAPI input by hand. Synchronize both files and pin the exact framework
revision together:

```sh
pnpm openapi:sync -- \
  --source ../lenso/contracts/openapi/app-api.v1.yaml \
  --revision "$(git -C ../lenso rev-parse HEAD)"
```

`pnpm check` verifies both inputs against the recorded digest, the pinned Git
revision, and the committed bytes from an authoritative framework checkout. It
uses `LENSO_FRAMEWORK_ROOT` or a sibling `../lenso` checkout. A direct
`node scripts/sync-openapi.mjs --check` invocation can also use an explicit
`--source`, which takes precedence. The check fails when no source is available
or its HEAD does not match the recorded revision:

```sh
LENSO_FRAMEWORK_ROOT=../lenso pnpm check
```

For an isolated, non-CI inspection of already-pinned site files only, run
`node scripts/sync-openapi.mjs --check --offline-metadata-only`. This narrow
mode does not authenticate the revision against Git and must not be used by CI
or release checks.

The same gate validates current product vocabulary, lifecycle order, local
documentation links, and static assets across every production-published page.
After the static build it also confirms that draft pages containing retired
product models are absent from routes, search, raw Markdown, agent catalogs,
and the sitemap.

## Structure

- `pages/index.astro`: custom Lenso homepage
- `content/docs`: public Markdown and MDX documentation
- `content/docs/**/meta.ts`: navigation order and group metadata
- `openapi/app-api.v1.yaml`: committed public API reference input
- `public/lenso-assets`: brand and explanatory assets
- `blume.config.ts`: navigation, search, SEO, AI-readable output, and API reference
