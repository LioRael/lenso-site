---
title: Code extension
description: Browse and apply code resources, and configure project conventions and module selection.
---

# Code extension

The Code extension finds code resources in the configured catalog and shows proposed changes before applying them. Add the extension to your project and complete its configuration:

```sh
lenso ext add code
lenso code search
```

## Preview and update

Replace `ITEM` with the name of a resource in the catalog:

```sh
lenso code preview ITEM
lenso code add ITEM
lenso code diff ITEM
lenso code update ITEM
```

Preview shows file diffs. Adding and updating require review and confirmation; processes used to install native dependencies also require separate authorization. `lenso code update ITEM` updates a code resource, while `lenso update` updates the extension dependency lock.

For an existing, prepared native application, you can also run `lenso init --preset code`, followed by `lenso code preview auth` and `lenso code add auth`. Depending on the selected modules, Code asks about the project language, runtime, and adapter bindings.

## Project configuration

Code stores project conventions in its own `lenso.code.toml`; Host configuration remains in `lenso.toml`. Use the commands to inspect the configuration or review changes first:

```sh
lenso code config
lenso code config --language typescript --runtime node26
lenso code config --modules-path src/modules --import-alias '@/modules'
lenso code config --convention styles=tailwind
lenso code config --provider lenso.auth-store=postgres
```

`code config` without settings only reads the configuration. Configuration writes use the project plan and confirmation flow. After changing conventions, affected installed modules may need explicit review with `--reconfigure`.

Code 0.3.5 uses the official module catalog `lenso.modules.toml`. When migrating from an older official configuration, upgrade Code first, then run `lenso ext configure code` to review the migration proposal. Custom configurations are not silently replaced.

Further reading: [Project configuration and migration](https://github.com/LioRael/lenso-cli/blob/main/docs/code-project-configuration.md), [Target languages and runtimes](https://github.com/LioRael/lenso-cli/blob/main/docs/code-target-variants.md), and [Native dependency management](https://github.com/LioRael/lenso-cli/blob/main/docs/native-dependencies.md).
