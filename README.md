# Lenso documentation

The Lenso public site and documentation, built with Next.js and Fumadocs.
Markdown and MDX under `content/docs` are the source of truth for readers,
search, `llms.txt`, and per-page Markdown routes. The site also owns the public
Plugin browsing experience while catalog signing, publishing, and installation
authority remain in the Marketplace and the adopting Host.

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

The static build is written to `out/`. `pnpm deploy:dry-run` verifies the
Cloudflare Workers static-assets package without publishing it.

`pnpm check` validates the bilingual docs, all local links, the static
build, AI-readable catalogs, and draft exclusion.

## Structure

- `content/docs`: current Markdown and MDX documentation
- `content/docs/**/meta.ts`: navigation order and group metadata
- `app`: Next.js routes for the home page, Plugin browsing, docs, search, and
  AI-readable output
- `lib/source.ts`: Fumadocs content source and page tree
- `public/lenso-assets`: brand and explanatory assets

The Plugin page keeps its registry candidate separate from signed results.
To include current Portable releases in a static build, set
`LENSO_MARKETPLACE_PORTABLE_URL` to the Marketplace HTTPS
`/api/marketplace/v1/snapshot` endpoint. To include source-only linked Cargo
releases, set `LENSO_MARKETPLACE_LINKED_CARGO_URL` to its HTTPS
`/api/marketplace/v1/linked-cargo` endpoint. Either or both may be configured.
In either case, set
`LENSO_MARKETPLACE_CATALOG_ID`, `LENSO_MARKETPLACE_KEY_ID`, and
`LENSO_MARKETPLACE_PUBLIC_KEY_HEX` to the independently trusted public
identity shared by these Marketplace channels. The build verifies each exact
signed payload, catalog identity, and validity window; missing configuration
produces an empty signed section, while an incomplete or invalid configuration
fails the build. The generated data is ignored by Git. The directory hides
expired results in the browser; prebuilt version pages remain readable with
their build-time expiry and are not current installation authority. Renewal
requires a new Site build. Site does not persist a catalog checkpoint across
builds, so signature verification alone does not exclude a still-valid older
revision. The directory searches both signed channels with the same filters
and links each listed identity to an exact-version page,
while labeling their different distribution and target evidence. A Portable
base snapshot does not declare target compatibility or carry versioned
documentation; its version page explicitly reports that absence rather than
substituting linked or candidate content. This is display evidence only: the
adopting Host must independently verify the current signed snapshot and exact
Bundle or crate before admission.
Each listed linked release gets an exact version page. The page links only to
Markdown revisions whose bytes and digests were verified during the same build;
the public Markdown route is read-only. The local `lenso app add` example needs
the actual signed snapshot, trust file, and matching `.crate` from an approved
source. Site never adopts a Plugin on behalf of a local project. Run
`pnpm check:linked-site-integration` to build against temporary locally signed
HTTPS Portable and linked fixtures and prove the shared directory, both exact
version pages, and the linked version → document page/API path. This is
fixture evidence, not a claim of a live production catalog. Separately signed
release-details and Portable versioned documentation remain an integration
step once their public endpoint and immutable base-release join are available.

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
- Reference pages hold compatibility and platform boundaries, repository
  ownership, and architecture decisions; tutorials should not make readers
  traverse them to finish a task.
- Verification appears at the end of the behavior it proves. It is completion
  evidence, not the subject of the page.
- Commands and public APIs must come from current `--help`, package source, or
  an owner repository's executable example. Planned APIs are labeled as such.
- English and Chinese documents have identical relative paths. `check:docs`
  rejects a page that exists in only one language.
