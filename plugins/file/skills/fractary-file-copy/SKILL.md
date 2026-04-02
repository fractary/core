---
name: fractary-file-copy
description: Copy a file within storage
---

# Copy

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<dest-path>` | Yes | dest-path |
| `<src-path>` | Yes | src-path |
| `--source` | No | source |
| `--json` | No | json |
| `--context` | No | context |

## Execution

Copy a file within storage using the CLI command `fractary-core file copy`.

Examples:
- `fractary-core file copy docs/file.txt docs/file-backup.txt`
- `fractary-core file copy archive/SPEC-001.md archive/SPEC-001-copy.md --source specs`
- `fractary-core file copy data.json data-backup.json --json`
