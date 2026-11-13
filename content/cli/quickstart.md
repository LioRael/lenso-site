---
title: 快速开始
description: 创建项目、添加扩展并预览代码变更。
---

# 快速开始

## 创建项目

安装 CLI 后，使用空预设创建一个项目：

```sh
lenso new my-app --preset empty
cd my-app
```

如果已经有项目，在项目目录中运行 `lenso init --preset empty`。

## 添加 Code 扩展

```sh
lenso ext add code
lenso ext tree
```

Code 的配置流程会询问要使用的 GitHub 仓库和目录。检查扩展配置及请求的权限后再确认。`ext tree` 显示已解析的扩展及其依赖。

## 浏览并应用资源

```sh
lenso code search
lenso code preview ITEM
lenso code add ITEM
```

将 `ITEM` 替换为目录中的资源名。`preview` 展示拟议的文件差异，`add` 在应用变更前请求确认。构建应用或安装原生依赖可能需要额外工具和单独的进程授权。

扩展会自动准备所需依赖，无须先运行安装命令。将生成的 `lenso.toml` 和 `lenso.lock` 提交到版本控制，帮助其他人使用相同的声明和锁定结果。

继续了解 [Code 扩展](/cli/code/) 或 [shadcn 扩展](/cli/shadcn/)。
