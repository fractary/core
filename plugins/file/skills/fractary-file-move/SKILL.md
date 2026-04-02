---
name: fractary-file-move
description: Move a file within storage
---

# Move

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<dest-path>` | Yes | dest-path |
| `<src-path>` | Yes | src-path |
| `--source` | No | source |
| `--json` | No | json |
| `--context` | No | context |

## Execution

Move a file within storage using the CLI command `fractary-core file move`.

Examples:
- `fractary-core file move docs/file.txt archive/file.txt`
- `fractary-core file move temp/SPEC-001.md archive/SPEC-001.md --source specs`
- `fractary-core file move old.json new.json --json`
