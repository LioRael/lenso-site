---
title: Configuration, lockfile, and cache
description: Understand project declarations, dependency locking, the shared cache, and offline operation.
---

# Configuration, lockfile, and cache

| Location | Purpose |
| --- | --- |
| `lenso.toml` | The project's extension selections, options, Registry routes, and permissions |
| `lenso.lock` | The resolved dependency graph, versions, manifests, and source and module hashes |
| User cache | Verified metadata and Wasm content that can be reused across projects |

Commit `lenso.toml` and `lenso.lock` to version control. Dependencies are automatically prepared on first execution, and Wasm modules are downloaded when a handler needs them. The cache does not store project permissions or interactive answers.

## Select a project

By default, Lenso searches upward from the current directory for the nearest `lenso.toml`. Use `--project` to specify the project directory explicitly:

```sh
lenso --project /path/to/project ext tree
lenso --project /path/to/project config --json
```

`config` inspects project declarations without loading extensions.

## Locking and offline mode

```sh
lenso --locked ext tree
lenso --offline ext tree
lenso update
```

`--locked` requires an existing lockfile that matches the declarations. `--offline` prohibits dependency HTTP requests and uses only local sources or the existing cache; it fails if required data is missing. `lenso update` explicitly refreshes dependency metadata and version selections and cannot be used with `--locked`.

## Cache location

```sh
lenso cache path
```

The default location is `~/Library/Caches/lenso` on macOS, `$XDG_CACHE_HOME/lenso` on Linux (`~/.cache/lenso` if unset), and `%LOCALAPPDATA%/Lenso/Cache` on Windows. You can set `LENSO_CACHE_DIR` to an absolute path.

Deleting the cache does not change locked versions; subsequent runs restore the required content according to the lockfile. For details, see the [upstream protocol documentation](https://github.com/LioRael/lenso-cli/blob/main/docs/protocol.md) and [Registry documentation](https://github.com/LioRael/lenso-cli/blob/main/docs/registry.md).
