---
title: 扩展与预设
description: 在项目中添加、配置和移除扩展，或使用预设组合扩展。
---

# 扩展与预设

扩展提供命令和工作流，预设则选择一组扩展，并可定义创建或接入项目的流程。扩展选择属于项目；未知命令不会自动搜索或安装扩展。

## 管理扩展

```sh
lenso ext add code
lenso ext configure code
lenso ext tree
lenso update
lenso ext remove code
```

添加或重新配置时，请检查依赖、配置和权限。移除直接选择不会删除仍被其他扩展或预设需要的依赖。`lenso update` 刷新项目扩展的版本锁定，不更新 CLI 可执行文件。

官方短名称通过 [Lenso Registry](https://github.com/LioRael/lenso-registry) 解析。自定义命名空间需要在项目配置中声明对应的 Registry 路由，也可以使用明确的 GitHub Release 来源：

```sh
lenso ext add @acme/tool --constraint '^1'
lenso ext add github-release:acme/lenso-tools/tool --id tool
```

扩展依赖关系不会自动授予文件、网络或进程权限。Registry 是解析来源的信任根，内容哈希用于完整性校验，并不验证发布者签名。

## 使用预设

```sh
lenso new my-web-app --preset shadcn
cd my-web-app
lenso shadcn preview button
lenso shadcn add button
```

该预设创建 Vite、React、TypeScript 和 Tailwind 项目。在已经准备好的前端项目中，可以使用 `lenso init --preset shadcn`。现有项目也可以通过 `lenso preset apply NAME_OR_URL` 应用预设。

更多解析、依赖和锁定细节见[上游 Registry 文档](https://github.com/LioRael/lenso-cli/blob/main/docs/registry.md)。
