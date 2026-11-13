---
title: Extensions and presets
description: Add, configure, and remove extensions in a project, or use presets to combine extensions.
---

# Extensions and presets

Extensions provide commands and workflows. Presets select a set of extensions and can define a flow for creating or initializing a project. Extension selection belongs to the project; unknown commands do not automatically search for or install extensions.

## Manage extensions

```sh
lenso ext add code
lenso ext configure code
lenso ext tree
lenso update
lenso ext remove code
```

When adding or reconfiguring an extension, check its dependencies, configuration, and permissions. Removing a direct selection does not remove dependencies still required by other extensions or presets. `lenso update` refreshes the project's extension version locks; it does not update the CLI executable.

Official short names are resolved through the [Lenso Registry](https://github.com/LioRael/lenso-registry). Custom namespaces require a corresponding Registry route in the project configuration. You can also use an explicit GitHub Release source:

```sh
lenso ext add @acme/tool --constraint '^1'
lenso ext add github-release:acme/lenso-tools/tool --id tool
```

Extension dependencies do not automatically grant file, network, or process permissions. A Registry is a trust root for source resolution. Content hashes verify integrity, but do not verify publisher signatures.

## Use presets

```sh
lenso new my-web-app --preset shadcn
cd my-web-app
lenso shadcn preview button
lenso shadcn add button
```

This preset creates a Vite, React, TypeScript, and Tailwind project. In an existing, prepared frontend project, you can use `lenso init --preset shadcn`. Existing projects can also apply a preset with `lenso preset apply NAME_OR_URL`.

For more on resolution, dependencies, and locking, see the [upstream Registry documentation](https://github.com/LioRael/lenso-cli/blob/main/docs/registry.md).
