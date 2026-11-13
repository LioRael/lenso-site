---
title: 自动化与 JSON
description: 在 Agent 和 CI 中使用结构化结果、答案文件与非交互模式。
---

# 自动化与 JSON

`--json` 让命令输出结构化结果，并关闭交互提示、进度和终端颜色。普通结果或诊断以一个 JSON 对象写入 stdout；进程日志写入 stderr。`--help` 和 `--version` 仍输出普通文本。

```sh
lenso code preview ITEM --json
lenso code add ITEM --json --answers answers.json
```

将 `ITEM` 替换为你的目录中的资源名。当工作流需要输入时，结果的 `status` 为 `needs_input`，进程退出码为 `2`。读取返回的问题 ID，在答案文件中提供对应答案，然后重新运行命令。不要在答案文件中存放秘密：答案会提供给该工作流的处理器。

工作流输入也可以通过 `--input` 传入 JSON 对象。输入格式由具体工作流定义，不同工作流的问题和字段可能不同。

## 确认与权限

```sh
lenso code add ITEM --json --yes
```

`--yes` 只对明确的确认问题回答 true；它不会选择选项、填写文本或授予新权限。`--no-interactive` 禁止打开终端提示。自动化环境中仍应检查计划、问题和诊断，不能把缺少输入当作成功。

## 退出码

| 退出码 | 含义 |
| --- | --- |
| `0` | 完成 |
| `2` | 需要输入或参数解析错误 |
| `1` | Host 或扩展失败；复合项目应用失败也使用此码 |
| `130` | 应用前取消，或独立进程取消 |

独立子进程失败时也可能返回其非零退出码。文件或进程执行失败可能留下部分已完成的操作，检查诊断后再重试。

结果结构、问题类型、Host 能力和完整退出码说明见[上游协议文档](https://github.com/LioRael/lenso-cli/blob/main/docs/protocol.md)。
