---
title: 嵌入 Rust CLI
description: 使用 lenso-cli crate 注册原生命令并运行工作流。
---

# 嵌入 Rust CLI

`lenso-cli` crate 提供命令注册、异步处理器、工作流步骤、hooks 和可恢复的问题。最小的原生 CLI 不需要项目配置或 Wasm 运行时。

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

原生处理器是受信任的应用代码。参阅 [Acme CLI 示例](https://github.com/LioRael/lenso-cli/tree/main/examples/acme-cli)，了解问题处理和可选的扩展加载。

| Crate | 作用 |
| --- | --- |
| `lenso` | 独立的 `lenso` 可执行文件 |
| `lenso-cli` | 可嵌入的命令与工作流引擎 |
| `lenso-runtime` | Host、Wasm 执行、分发、锁文件和缓存 |
| `lenso-project` | 可选的文件计划、预览和审阅后应用 |
| `lenso-composition` | 能力与实例解析 |
| `lenso-codegen` | 生成契约与模板渲染 |

`lenso` 和 `lenso-cli` 1.0 将这些 crate 名称从旧的主 Lenso 仓库迁移到独立 CLI 项目。这是破坏性迁移；旧 SDK 使用者应保持 0.x 版本约束。详见 [crate 发布与迁移说明](https://github.com/LioRael/lenso-cli/blob/main/docs/crates-release.md)。
