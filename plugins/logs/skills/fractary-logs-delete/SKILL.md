---
name: fractary-logs-delete
description: Delete a log entry. Use when deleting a file from storage.
---

# Delete

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | id |
| `--json` | No | json |
| `--context` | No | context |

## Execution

Delete a log entry using the CLI command `fractary-core logs delete`.

Examples:
- `fractary-core logs delete session-2026-01-15-abc123`
- `fractary-core logs delete build-2026-01-10-def456 --json`
