---
title: shadcn extension
description: Search for, preview, and add components from shadcn registries.
---

# shadcn extension

The shadcn extension can consume the official Registry, configured namespaces, explicit Registry item URLs, and project-local JSON items. Files, dependency declarations, CSS, and environment file defaults are presented as a plan for review.

## Create or initialize a project

Create a new project:

```sh
lenso new my-web-app --preset shadcn
cd my-web-app
lenso shadcn preview button
lenso shadcn add button
```

For an existing frontend project, use `lenso init --preset shadcn`. The target project needs a TypeScript configuration and a Tailwind 4 CSS entry point.

## Search and update

```sh
lenso shadcn search --query button
lenso shadcn list @private --type registry:ui --limit 20
lenso shadcn diff button
lenso shadcn components update button
```

`search` and `list` search the official catalog by default. `diff` compares the current Registry resource with project files without applying files or executing processes, but initial dependency preparation may still create a lockfile and populate the cache. `components update` reviews the update plan and requires handling files with differences.

## Namespaces and monorepos

Configure Registry namespaces in the active workspace's `components.json`. Private Registry credentials require project environment variables, target bindings, and HTTP authorization; do not put credentials in URLs. The extension does not automatically read `.env` or `.env.local` for authentication variables.

In a monorepo, use `--cwd` to select the application workspace:

```sh
lenso shadcn preview @private/dashboard --cwd apps/web
lenso shadcn add button input --cwd apps/web
```

If the workspace cannot be determined, the CLI asks you to select one. For supported features, authentication, dependency installation, and limitations, see the [upstream shadcn documentation](https://github.com/LioRael/lenso-cli/blob/main/docs/shadcn.md).
