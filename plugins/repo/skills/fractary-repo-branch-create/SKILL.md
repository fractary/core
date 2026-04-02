---
name: fractary-repo-branch-create
description: Create a new git branch. Use when creating a new git branch.
---

# Branch Create

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<branch-name>` | Yes | branch-name |
| `--base` | No | base |
| `--checkout` | No | checkout |
| `--json` | No | json |
| `--context` | No | context |

## Execution

Create a new git branch using the CLI command `fractary-core repo branch-create`.

Examples:
- `fractary-core repo branch-create feature/123`
- `fractary-core repo branch-create feature/123 --base main --checkout`

Execute in a single message. Do not use any other tools. Do not send any other text.
