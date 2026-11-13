---
title: Installation
description: Install and update Lenso CLI on macOS, Linux, or Windows.
---

# Installation

Lenso provides native binaries for macOS on Apple Silicon and Intel, Linux on ARM64 and x64, and Windows on x64. Running the CLI does not require Node.js, Git, or Rust. Building a generated project may still require that project's own toolchain.

macOS requires version 13.0 or later, and Linux requires glibc 2.35 or later. Release packages are not signed with Developer ID or Authenticode, and macOS packages are not notarized. Checksums verify file integrity; they are not independent publisher signatures.

## Homebrew

On macOS or Linux:

```sh
brew install LioRael/tap/lenso
lenso --version
```

Update a Homebrew-managed installation with `brew update` and `brew upgrade LioRael/tap/lenso`.

## Native installation scripts

On macOS and Linux:

```sh
curl -fsSL \
  https://github.com/LioRael/lenso-cli/releases/latest/download/install.sh \
  -o install.sh
sh install.sh
export PATH="$HOME/.local/bin:$PATH"
lenso --version
```

On Windows PowerShell:

```powershell
Invoke-WebRequest `
  https://github.com/LioRael/lenso-cli/releases/latest/download/install.ps1 `
  -OutFile install.ps1
& .\install.ps1
$env:PATH = "$env:LOCALAPPDATA\Lenso\bin;$env:PATH"
lenso --version
```

The installation scripts do not modify shell startup files or the permanent PATH. Replacing an existing executable requires `--force` on Unix or `-Force` on Windows. The scripts check the SHA-256 hash of the download and the executable version.

## Cargo

```sh
cargo install lenso --version 1.1.2 --locked
```

## Updates

Native installations support checking for and installing updates:

```sh
lenso self update --check
lenso self update
```

Update Cargo and Homebrew installations through their respective package managers. Older or manually installed executables may first require `lenso self update --adopt`; use this option only for an executable you want the native updater to manage.

`lenso self update` updates the CLI itself, while `lenso update` updates the current project's extension version locks. For installation locations, offline installation, and further update details, see the [upstream installation guide](https://github.com/LioRael/lenso-cli/blob/main/docs/install.md).
