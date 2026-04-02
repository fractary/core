---
name: fractary-logs-list
description: List logs. Use when listing files in storage.
---

# List

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--type` | No | type |
| `--status` | No | status |
| `--issue` | No | issue |
| `--limit` | No | limit |
| `--json` | No | json |
| `--context` | No | context |

## Execution

List logs using the CLI command `fractary-core logs list`.

Examples:
- `fractary-core logs list`
- `fractary-core logs list --type session --json`
- `fractary-core logs list --issue 42 --limit 10 --json`
- `fractary-core logs list --type build --status active --json`
