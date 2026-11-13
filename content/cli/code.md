---
title: Code 扩展
description: 浏览和应用代码资源，配置项目约定与模块选择。
---

# Code 扩展

Code 扩展从配置的目录中查找代码资源，并在应用前展示拟议变更。在项目中添加扩展并完成配置：

```sh
lenso ext add code
lenso code search
```

## 预览与更新

将 `ITEM` 替换为目录中的资源名：

```sh
lenso code preview ITEM
lenso code add ITEM
lenso code diff ITEM
lenso code update ITEM
```

预览显示文件差异。添加和更新需要审阅并确认，原生依赖安装涉及的进程也需要单独授权。`lenso code update ITEM` 更新代码资源；`lenso update` 更新的是扩展依赖锁定。

对于已经准备好的原生应用，也可以使用 `lenso init --preset code`，再运行 `lenso code preview auth` 和 `lenso code add auth`。Code 会根据所选模块询问项目语言、运行时和适配器绑定。

## 项目配置

Code 将项目约定保存在扩展自己的 `lenso.code.toml` 中，Host 配置仍保存在 `lenso.toml`。先用命令检查或审阅修改：

```sh
lenso code config
lenso code config --language typescript --runtime node26
lenso code config --modules-path src/modules --import-alias '@/modules'
lenso code config --convention styles=tailwind
lenso code config --provider lenso.auth-store=postgres
```

不带设置的 `code config` 只读取配置。配置写入使用项目计划和确认流程。变更约定后，受影响的已安装模块可能需要通过 `--reconfigure` 明确审阅。

Code 0.3.5 使用官方模块目录 `lenso.modules.toml`。从旧官方配置迁移时，先升级 Code，再运行 `lenso ext configure code` 审阅迁移提案。自定义配置不会被默默替换。

进一步阅读：[项目配置与迁移](https://github.com/LioRael/lenso-cli/blob/main/docs/code-project-configuration.md)、[目标语言与运行时](https://github.com/LioRael/lenso-cli/blob/main/docs/code-target-variants.md)、[原生依赖管理](https://github.com/LioRael/lenso-cli/blob/main/docs/native-dependencies.md)。
