---
title: Lenso CLI
description: Run extension commands and review file changes with the native CLI, or embed the workflow engine in your own Rust CLI.
---

# Lenso CLI

Lenso is a native CLI. It loads extensions in your project so you can run workflows for distributing and generating code. File changes are previewed for confirmation before they are applied. Project permissions control an extension's access to files, the network, and processes.

You can also embed the Rust workflow engine in your own CLI and register native commands and handlers.

## Where to start

- [Install Lenso](/cli/installation/) using the method that suits your platform.
- Follow the [quickstart](/cli/quickstart/) to create a project and add your first extension.
- Read [Extensions and presets](/cli/extensions/) to manage extensions in your project.
- Read [Automation and JSON](/cli/automation/) to handle inputs and results in agents or CI.

## Official extensions

[Code](/cli/code/) lets you browse, preview, and apply code resources, and supports module composition and generation. [shadcn](/cli/shadcn/) lets you consume components and other resources from shadcn registries.

Extensions are selected per project; there is no global extension installation. The project's `lenso.toml` stores declarations and permissions, while `lenso.lock` pins the resolution result. See [Configuration, lockfile, and cache](/cli/configuration/).

For full protocol and development details, see the [lenso-cli source repository](https://github.com/LioRael/lenso-cli).
