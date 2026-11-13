---
title: Automation and JSON
description: Use structured results, answer files, and non-interactive mode in agents and CI.
---

# Automation and JSON

`--json` gives commands structured output and disables interactive prompts, progress, and terminal colors. A normal result or diagnostic is written to stdout as a single JSON object; process logs go to stderr. `--help` and `--version` still output plain text.

```sh
lenso code preview ITEM --json
lenso code add ITEM --json --answers answers.json
```

Replace `ITEM` with the name of a resource in your catalog. When a workflow needs input, the result's `status` is `needs_input` and the process exits with code `2`. Read the returned question IDs, provide corresponding answers in the answer file, and run the command again. Do not store secrets in the answer file: answers are provided to that workflow's handler.

Workflow input can also be passed as a JSON object with `--input`. The input format is defined by each workflow; questions and fields may differ between workflows.

## Confirmation and permissions

```sh
lenso code add ITEM --json --yes
```

`--yes` answers true only to explicit confirmation questions. It does not select options, fill in text, or grant new permissions. `--no-interactive` prevents terminal prompts from opening. In automated environments, still check plans, questions, and diagnostics; do not treat missing input as success.

## Exit codes

| Exit code | Meaning |
| --- | --- |
| `0` | Completed |
| `2` | Input needed or argument parsing error |
| `1` | Host or extension failure; also used for composite project application failures |
| `130` | Cancelled before applying, or a standalone process was cancelled |

A standalone subprocess failure may also return its nonzero exit code. A file or process execution failure may leave some operations completed; check the diagnostics before retrying.

For the result structure, question types, Host capabilities, and the complete exit code reference, see the [upstream protocol documentation](https://github.com/LioRael/lenso-cli/blob/main/docs/protocol.md).
