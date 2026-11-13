---
title: 配置、锁文件与缓存
description: 了解项目声明、依赖锁定、共享缓存及离线运行。
---

# 配置、锁文件与缓存

| 位置 | 作用 |
| --- | --- |
| `lenso.toml` | 项目的扩展选择、选项、Registry 路由和权限 |
| `lenso.lock` | 已解析的依赖图、版本、清单及来源和模块哈希 |
| 用户缓存 | 可供不同项目复用、经过校验的元数据和 Wasm 内容 |

将 `lenso.toml` 和 `lenso.lock` 提交到版本控制。首次执行时会自动准备依赖，Wasm 模块在处理器需要时下载。缓存不保存项目权限或交互答案。

## 选择项目

默认从当前目录向上查找最近的 `lenso.toml`。使用 `--project` 可以明确指定项目目录：

```sh
lenso --project /path/to/project ext tree
lenso --project /path/to/project config --json
```

`config` 检查项目声明，不加载扩展。

## 锁定与离线模式

```sh
lenso --locked ext tree
lenso --offline ext tree
lenso update
```

`--locked` 要求已有锁文件与声明一致。`--offline` 禁止依赖 HTTP 请求，只使用本地来源或已有缓存；缺少所需数据时会失败。`lenso update` 显式刷新依赖元数据和版本选择，不能与 `--locked` 同时使用。

## 缓存位置

```sh
lenso cache path
```

默认位置为 macOS 的 `~/Library/Caches/lenso`、Linux 的 `$XDG_CACHE_HOME/lenso`（未设置时为 `~/.cache/lenso`），以及 Windows 的 `%LOCALAPPDATA%/Lenso/Cache`。可以用绝对路径设置 `LENSO_CACHE_DIR`。

删除缓存不会改变锁定版本；后续运行会按锁文件恢复所需内容。更多细节见[上游协议文档](https://github.com/LioRael/lenso-cli/blob/main/docs/protocol.md)和 [Registry 文档](https://github.com/LioRael/lenso-cli/blob/main/docs/registry.md)。
