---
name: fractary-file-exists
description: Check if a file exists in storage
---

# Exists

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<path>` | Yes | path |
| `--source` | No | source |
| `--json` | No | json |
| `--context` | No | context |

## Execution

Check if a file exists in storage using the CLI command `fractary-core file exists`.

Examples:
- `fractary-core file exists data.json`
- `fractary-core file exists archive/SPEC-001.md --source specs`
- `fractary-core file exists config.yaml --json`
