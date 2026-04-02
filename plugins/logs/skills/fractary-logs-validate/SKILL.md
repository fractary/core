---
name: fractary-logs-validate
description: Validate a log file against its type schema
---

# Validate

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<file>` | Yes | file |
| `--log-type` | No | log type |
| `--json` | No | json |
| `--context` | No | context |

## Execution

Validate a log file against its type schema using the CLI command `fractary-core logs validate`.

Examples:
- `fractary-core logs validate .fractary/logs/session/2026-01-15-debug.md`
- `fractary-core logs validate ./logs/build-output.md --log-type build --json`
- `fractary-core logs validate .fractary/logs/audit/compliance-check.md --json`
