---
name: fractary-file-delete
description: Delete a file from storage
---

# Delete

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<path>` | Yes | path |
| `--source` | No | source |
| `--json` | No | json |
| `--context` | No | context |

## Execution

Delete a file from storage using the CLI command `fractary-core file delete`.

Examples:
- `fractary-core file delete docs/old-file.txt`
- `fractary-core file delete archive/SPEC-001.md --source specs`
- `fractary-core file delete temp/data.json --json`
