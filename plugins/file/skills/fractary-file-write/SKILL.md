---
name: fractary-file-write
description: Write content to a storage path
---

# Write

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<path>` | Yes | path |
| `--source` | No | source |
| `--json` | No | json |
| `--context` | No | context |
| `--content` | Yes | content |

## Execution

Write content to a storage path using the CLI command `fractary-core file write`.

Examples:
- `fractary-core file write data.json --content '{"key":"value"}'`
- `fractary-core file write docs/notes.txt --content "Meeting notes" --source specs`
- `fractary-core file write config.yaml --content "version: 1.0" --json`
