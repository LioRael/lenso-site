# Lenso Site

Fumadocs + Next.js site for the Lenso homepage and documentation.

## Development

```sh
pnpm dev
```

## Build

```sh
pnpm build
```

## Preview Static Export

```sh
pnpm start
```

## Structure

- `src/app/(home)/page.tsx`: homepage
- `content/docs`: Fumadocs MDX content
- `src/lib/layout.shared.tsx`: shared nav and repository links

Skipped for the first pass: versioned docs, CMS, AI chat, and OpenAPI
playground.
