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

## Documentation model

Write navigation around a reader's job, not an internal subsystem. The first
page of a workflow should produce one observable result. Split another page
when the reader must choose a different language, authoring path, or product
role.

- Tutorials own one complete sequence from prerequisite to observable behavior.
- Agent-assisted Lenso development is the first workflow; developing the Agent
  product itself remains a separate, later section.
- Web backend development is a top-level workflow beside Agent product
  development. Its pages follow the Endpoint, Host integration, and real-socket
  proof sequence.
- Plugin guides separate portable Rust, linked Rust, and Bun authoring paths.
- Concept pages define a term once and link back to concrete workflows.
- Reference pages hold status matrices, repository ownership, and architecture
  decisions; tutorials should not make readers traverse them to finish a task.
- Verification appears at the end of the behavior it proves. It is completion
  evidence, not the subject of the page.
- Commands and public APIs must come from current `--help`, package source, or
  an owner repository's executable example. Planned APIs are labeled as such.
- English and Chinese documents have identical relative paths. `check:docs`
  rejects a page that exists in only one language.
