---
name: fractary-file-list
description: List files in storage
---

# List

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--prefix` | No | prefix |
| `--source` | No | source |
| `--json` | No | json |
| `--context` | No | context |

## Execution

List files in storage using the CLI command `fractary-core file list`.

Examples:
- `fractary-core file list`
- `fractary-core file list --prefix docs/`
- `fractary-core file list --source specs --json`
- `fractary-core file list --prefix archive/ --source specs`
