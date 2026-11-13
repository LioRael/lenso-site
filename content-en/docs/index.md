---
title: Lenso Docs
description: Build a Lenso documentation site with Markdown and MDX.
---

# Lenso Docs

Lenso Docs is a static documentation site framework. You write Markdown or MDX and configure the site; `@lenso/docs` generates routes, the reading interface, search indexes, and static files. It is a separate topic alongside [Lenso CLI](/en/cli/) in the Lenso framework. This section covers `lenso-docs`, not the `lenso` command.

These pages describe the released `@lenso/docs` 0.3.1. It provides a sidebar, table of contents, syntax highlighting, and static search, and supports React components in MDX. The output can be deployed to static hosting without running a documentation server.

## Guides

- [Quickstart](/en/docs/quickstart/): create a project and start the development server.
- [Writing content](/en/docs/content/): learn about file routes, frontmatter, and MDX.
- [Site configuration](/en/docs/configuration/): set navigation, languages, and the deployment path.
- [Customization](/en/docs/customization/): register components, styles, and interface slots.
- [Build and deployment](/en/docs/deployment/): preview and publish the static output.

## Boundaries

Configuration, MDX, and local components are trusted project code, not a sandbox for untrusted content. Source Markdown and metadata are public build artifacts; never put credentials in them. The framework does not include OpenAPI ingestion, authenticated request playgrounds, a remote CMS, AI services, or hosting.

For further reading, see the upstream [README](https://github.com/LioRael/lenso-ui/blob/main/packages/docs/README.md) and [architecture notes](https://github.com/LioRael/lenso-ui/blob/main/packages/docs/ARCHITECTURE.md). These links track the upstream main branch, which may be newer than 0.3.1; use the installed package to verify version-specific behavior.
