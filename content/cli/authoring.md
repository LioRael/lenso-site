---
title: 开发与发布扩展
description: 了解扩展的 Wasm 分发、项目权限和 GitHub Release 发布流程。
---

# 开发与发布扩展

扩展通过预构建的 Wasm 包分发。扩展定义命令、工作流和处理器；Host 负责依赖解析、执行以及已授权的文件、网络和进程操作。声明依赖本身不会授予这些权限。

## 发布到 GitHub Releases

先构建扩展的 Wasm，再从作者项目准备和检查发布资产：

```sh
lenso --project AUTHOR_PROJECT publish --github \
  --repo acme/lenso-tools --id tool --dry-run
```

确认内容后，使用完整提交 SHA 发布：

```sh
lenso --project AUTHOR_PROJECT publish --github \
  --repo acme/lenso-tools --id tool --target FULL_COMMIT_SHA
```

替换示例中的项目路径、仓库、包 ID 和提交 SHA。发布流程打包声明的文件，检查身份和哈希，上传草稿并验证资产；发布前需要批准。消费者通过 GitHub HTTP API 下载预构建包，不需要 npm 或 Git checkout。

使用 `--draft` 可以保留已上传并验证的草稿。令牌通过环境变量提供，不要写进 URL 或文档。完整的包格式、认证和 GitHub Actions 示例见[上游 GitHub 分发文档](https://github.com/LioRael/lenso-cli/blob/main/docs/github-distribution.md)。

## 编写生成器

Code 支持编写生成器、声明目录和验证预览。[生成器开发指南](https://github.com/LioRael/lenso-cli/blob/main/docs/code-generation.md)包含接口和两个适配器的示例。扩展 Host API、权限与 JSON ABI 见[协议文档](https://github.com/LioRael/lenso-cli/blob/main/docs/protocol.md)。
