---
name: fractary-core-env-list
description: List available environments
---

# Env List

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--context` | No | context |

## Execution

List available environments using the CLI command `fractary-core config env-list`.

Shows all `.env` files found in `.fractary/env/` (standard) and project root (legacy), indicating the currently active environment and file location.

Examples:
- List environments: `fractary-core config env-list`
