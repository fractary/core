---
name: fractary-logs-read
description: Read a log entry. Use when reading file content from storage.
---

# Read

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | id |
| `--json` | No | json |
| `--context` | No | context |

## Execution

Read a log entry using the CLI command `fractary-core logs read`.

Examples:
- `fractary-core logs read session-2026-01-15-abc123`
- `fractary-core logs read build-2026-01-10-def456 --json`
