---
name: fractary-repo-pull
description: Pull branches from remote
---

# Pull

## Context

First gather current state:
- Run `git branch --show-current`
- Run `git rev-parse --abbrev-ref @{upstream} 2>/dev/null || echo "no upstream"`

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--rebase` | No | rebase |
| `--remote` | No | remote |
| `--json` | No | json |
| `--context` | No | context |

## Execution

Pull the latest changes from remote using the CLI command `fractary-core repo pull`.

Examples:
- `fractary-core repo pull`
- `fractary-core repo pull --rebase`
- `fractary-core repo pull --remote upstream`

Execute in a single message. Do not use any other tools. Do not send any other text.
