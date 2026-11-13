---
title: Quickstart
description: Create a project, add an extension, and preview code changes.
---

# Quickstart

## Create a project

After installing the CLI, create a project with the empty preset:

```sh
lenso new my-app --preset empty
cd my-app
```

If you already have a project, run `lenso init --preset empty` in the project directory.

## Add the Code extension

```sh
lenso ext add code
lenso ext tree
```

The Code configuration process asks which GitHub repository and directory to use. Check the extension configuration and requested permissions before confirming. `ext tree` displays the resolved extensions and their dependencies.

## Browse and apply resources

```sh
lenso code search
lenso code preview ITEM
lenso code add ITEM
```

Replace `ITEM` with the name of a resource in the catalog. `preview` shows the proposed file diff, and `add` asks for confirmation before applying changes. Building the application or installing native dependencies may require additional tools and separate process permissions.

Extensions automatically prepare the dependencies they need; there is no need to run an install command first. Commit the generated `lenso.toml` and `lenso.lock` to version control so others can use the same declarations and locked resolution.

Continue with the [Code extension](/en/cli/code/) or the [shadcn extension](/en/cli/shadcn/).
