# Lenso documentation

The independent bilingual Lenso TypeScript site consumes the published **@lenso/docs@0.1.0** CLI and precompiled presentation. **create-lenso-docs@0.1.0** was inspected by generating an empty disposable starter; it was never run over this checkout. The site uses the framework's generated Next application, document renderer, navigation, search, code highlighting and Markdown exports. The custom source adapter owns information architecture and exact product routes; it does not implement another docs engine.

## Run

Use Node 26.10 or later and this repository's pnpm 11.7.0:

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm preview
```

The dev server binds loopback by default. For another local port: pnpm dev --port 3219. pnpm build writes out/. The site remains static; no search account, application server or runtime Lenso service is needed. pnpm deploy:dry-run validates the existing Workers assets configuration locally; deployment requires separate authorization. There is one pnpm lockfile. Lenso runtime examples use their own Bun workflow, independently of the site.

## Content and provenance

- content/en and content/zh: 24 matching topics per language.
- docs.config.ts: exact framework, locale and public customization configuration.
- docs.source.mjs: source inventory, ordered groups, custom homepage routes and old-doc redirects.
- docs.components.tsx: product controls, source identity and article slots.
- routes/home.tsx and home.css: independent homepage, inspired by the current Lenso UI layout.
- public/api-inventory.json: verified public entries and registry artifact boundary.
- out/docs-inventory.json, llms.txt and llms-full.txt: generated agent-readable catalogs; raw Markdown is supplied byte-for-byte by the docs framework.

The framework source baseline is **6e239c71a38279885facce133ceb847bbfe12f2f**. Published Core quickstart was run against **@lenso/core@0.1.0**. Source and registry artifacts are deliberately distinguished: published Web 0.1.0 uses oRPC 1.15.5, while the source preview uses 2.0.0-beta.42 and newer configuration/Bun-listener APIs. CLI is separately versioned at 0.18.0. Log/OTel were not in npm at the 2026-10-08 check. See installation and API pages for the supported consumption path.

The previous site baseline was bce1f2c08d238cec9e57a4c7a0218c8413b804c5. Its Rust documentation and site/Marketplace implementation are retained under legacy/rust-site, excluded from current routing, search and compilation. Former documentation pages redirect to the same-language migration explanation; no Marketplace host, catalog trust or Console/Relay change is performed. Historic files are preserved as migration reference and are not covered by current-site checks.

## Checks

pnpm check runs bilingual navigation/link/fence validation, TypeScript, oxlint, the real static build, and exported HTML/search/Markdown/catalog checks. Optional upstream file verification: set LENSO_SOURCE_CHECKOUT to a read-only checkout containing the pinned commit before pnpm check:docs. This compares source targets against git ls-tree at that exact ref, without requiring private paths in repository files.

Generated .lenso/ and out/ are framework-owned and ignored. Do not edit them. The site imports the package's compiled CSS once; it does not build Lenso UI source, regenerate component APIs or add a raw StyleX compilation union.

Chinese search uses the public static-index override and DocumentationSearch.initOrama with a shared Han tokenizer. Fumadocs' lightweight Markdown structure pass runs only when Chinese content changes; the generated .lenso-search/ index is ignored. English keeps the framework default. No second document renderer or search service is involved.
