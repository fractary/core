---
name: fractary-logs-search
description: Search logs. Use when searching entries.
---

# Search

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--type` | No | type |
| `--issue` | No | issue |
| `--regex` | No | regex |
| `--limit` | No | limit |
| `--json` | No | json |
| `--context` | No | context |
| `--query` | Yes | query |

## Execution

Search logs using the CLI command `fractary-core logs search`.

Examples:
- `fractary-core logs search --query "error" --json`
- `fractary-core logs search --query "timeout" --type build --json`
- `fractary-core logs search --query "deploy.*fail" --regex --issue 42 --json`
- `fractary-core logs search --query "memory leak" --limit 5 --json`
