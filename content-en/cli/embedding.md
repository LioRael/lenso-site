---
title: Embedding in a Rust CLI
description: Register native commands and run workflows with the lenso-cli crate.
---

# Embedding in a Rust CLI

The `lenso-cli` crate provides command registration, async handlers, workflow steps, hooks, and resumable questions. A minimal native CLI does not need project configuration or a Wasm runtime.

```toml
[dependencies]
lenso-cli = "1.0.0"
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

```rust
use lenso_cli::{Cli, CommandSpec, Error, Outcome, serde_json::json};

#[tokio::main]
async fn main() -> Result<(), Error> {
    let mut cli = Cli::new("acme");
    cli.command(CommandSpec {
        path: vec!["hello".into()],
        workflow: "acme/hello".into(),
        about: "Say hello".into(),
        provider: "acme".into(),
        arguments: vec![],
    }, |_context| async {
        Ok(Outcome::complete(json!({"message": "Hello!"})))
    })?;
    std::process::exit(cli.run().await);
}
```

Native handlers are trusted application code. See the [Acme CLI example](https://github.com/LioRael/lenso-cli/tree/main/examples/acme-cli) for question handling and optional extension loading.

| Crate | Purpose |
| --- | --- |
| `lenso` | The standalone `lenso` executable |
| `lenso-cli` | The embeddable command and workflow engine |
| `lenso-runtime` | Host, Wasm execution, distribution, lockfile, and cache |
| `lenso-project` | Optional file plans, previews, and application after review |
| `lenso-composition` | Capability and instance resolution |
| `lenso-codegen` | Generation contracts and template rendering |

`lenso` and `lenso-cli` 1.0 migrated these crate names from the old main Lenso repository to the standalone CLI project. This is a breaking migration; users of the old SDK should keep their 0.x version constraints. See the [crate release and migration notes](https://github.com/LioRael/lenso-cli/blob/main/docs/crates-release.md).
