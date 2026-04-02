---
name: fractary-logs-capture
description: Start session capture
---

# Capture

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<issue_number>` | Yes | issue number |
| `--model` | No | model |
| `--json` | No | json |
| `--context` | No | context |

## Execution

Start a session capture using the CLI command `fractary-core logs capture`.

Examples:
- `fractary-core logs capture 42`
- `fractary-core logs capture 15 --model claude-sonnet-4-6 --json`
- `fractary-core logs capture 99 --json`
