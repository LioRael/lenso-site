---
title: Lenso CLI
description: 使用原生 CLI 运行扩展命令、审阅文件变更，也可以将工作流引擎嵌入自己的 Rust CLI。
---

# Lenso CLI

Lenso 是一个原生 CLI。它在项目中加载扩展，让你通过命令运行代码分发、生成等工作流。文件变更会先展示预览并请求确认；扩展的文件、网络和进程访问由项目授权控制。

你也可以把 Rust 工作流引擎嵌入自己的 CLI，注册原生命令和处理器。

## 从哪里开始

- [安装 Lenso](/cli/installation/)，选择适合你的平台和安装方式。
- [快速开始](/cli/quickstart/)，创建项目并添加第一个扩展。
- [扩展与预设](/cli/extensions/)，了解如何管理项目中的扩展。
- [自动化与 JSON](/cli/automation/)，在 Agent 或 CI 中处理输入与结果。

## 官方扩展

[Code](/cli/code/) 用于浏览、预览和应用代码资源，也支持模块组合与生成。[shadcn](/cli/shadcn/) 用于消费 shadcn Registry 中的组件和其他资源。

扩展按项目选择，不存在全局扩展安装。项目的 `lenso.toml` 保存声明和权限，`lenso.lock` 固定解析结果。详见[配置、锁文件与缓存](/cli/configuration/)。

需要完整的协议和开发细节时，参阅 [lenso-cli 源码仓库](https://github.com/LioRael/lenso-cli)。
