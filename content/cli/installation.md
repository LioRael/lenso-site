---
title: 安装
description: 在 macOS、Linux 或 Windows 上安装和更新 Lenso CLI。
---

# 安装

Lenso 提供 macOS Apple Silicon 和 Intel、Linux ARM64 和 x64、Windows x64 的原生二进制文件。运行 CLI 不需要 Node.js、Git 或 Rust。构建生成的项目仍可能需要项目自身的工具链。

macOS 需要 13.0 或更新版本，Linux 需要 glibc 2.35 或更新版本。发行包未进行 Developer ID 或 Authenticode 签名，macOS 包也未公证。校验和用于验证文件完整性，不是独立的发布者签名。

## Homebrew

在 macOS 或 Linux 上：

```sh
brew install LioRael/tap/lenso
lenso --version
```

Homebrew 管理的安装通过 `brew update` 和 `brew upgrade LioRael/tap/lenso` 更新。

## 原生安装脚本

macOS 和 Linux：

```sh
curl -fsSL \
  https://github.com/LioRael/lenso-cli/releases/latest/download/install.sh \
  -o install.sh
sh install.sh
export PATH="$HOME/.local/bin:$PATH"
lenso --version
```

Windows PowerShell：

```powershell
Invoke-WebRequest `
  https://github.com/LioRael/lenso-cli/releases/latest/download/install.ps1 `
  -OutFile install.ps1
& .\install.ps1
$env:PATH = "$env:LOCALAPPDATA\Lenso\bin;$env:PATH"
lenso --version
```

安装脚本不会修改 shell 启动文件或永久 PATH。替换已有可执行文件需要在 Unix 上使用 `--force`，在 Windows 上使用 `-Force`。安装脚本会检查下载内容的 SHA-256 和可执行文件版本。

## Cargo

```sh
cargo install lenso --version 1.1.2 --locked
```

## 更新

原生安装支持检查和安装更新：

```sh
lenso self update --check
lenso self update
```

Cargo 和 Homebrew 安装应通过各自的包管理器更新。旧版或手动安装可能需要先使用 `lenso self update --adopt`；只对希望交给原生更新器管理的可执行文件使用该选项。

`lenso self update` 更新 CLI 本身，`lenso update` 更新当前项目的扩展版本锁定。更多安装位置、离线安装和更新细节见[上游安装文档](https://github.com/LioRael/lenso-cli/blob/main/docs/install.md)。
