---
name: fractary-logs-archive
description: Archive old logs. Use when archiving old entries.
---

# Archive

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--max-age` | No | max age |
| `--compress` | No | compress |
| `--json` | No | json |
| `--context` | No | context |

## Execution

Archive old logs using the CLI command `fractary-core logs archive`.

Examples:
- `fractary-core logs archive`
- `fractary-core logs archive --max-age 30 --compress --json`
- `fractary-core logs archive --max-age 60 --json`
