---
name: fractary-file-read
description: Read content from a storage path
---

# Read

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<path>` | Yes | path |
| `--source` | No | source |
| `--json` | No | json |
| `--context` | No | context |

## Execution

Read content from a storage path using the CLI command `fractary-core file read`.

Examples:
- `fractary-core file read data.json`
- `fractary-core file read docs/notes.txt --source specs`
- `fractary-core file read config.yaml --json`
