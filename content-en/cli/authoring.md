---
title: Developing and publishing extensions
description: Learn about Wasm distribution, project permissions, and publishing extensions to GitHub Releases.
---

# Developing and publishing extensions

Extensions are distributed as prebuilt Wasm packages. An extension defines commands, workflows, and handlers; the Host handles dependency resolution, execution, and authorized file, network, and process operations. Declaring a dependency does not itself grant these permissions.

## Publish to GitHub Releases

First build the extension's Wasm, then prepare and inspect the release assets from the author project:

```sh
lenso --project AUTHOR_PROJECT publish --github \
  --repo acme/lenso-tools --id tool --dry-run
```

After confirming the contents, publish using the full commit SHA:

```sh
lenso --project AUTHOR_PROJECT publish --github \
  --repo acme/lenso-tools --id tool --target FULL_COMMIT_SHA
```

Replace the example project path, repository, package ID, and commit SHA. The publishing flow packages the declared files, checks identity and hashes, uploads a draft, and verifies the assets; approval is required before release. Consumers download prebuilt packages through the GitHub HTTP API and do not need npm or a Git checkout.

Use `--draft` to retain the uploaded and verified draft. Supply tokens through environment variables; do not put them in URLs or documentation. For the full package format, authentication, and GitHub Actions examples, see the [upstream GitHub distribution documentation](https://github.com/LioRael/lenso-cli/blob/main/docs/github-distribution.md).

## Write generators

Code supports writing generators, declaring catalogs, and validating previews. The [generator development guide](https://github.com/LioRael/lenso-cli/blob/main/docs/code-generation.md) includes interfaces and examples of two adapters. For the extension Host API, permissions, and JSON ABI, see the [protocol documentation](https://github.com/LioRael/lenso-cli/blob/main/docs/protocol.md).
