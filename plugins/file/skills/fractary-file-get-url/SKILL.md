---
name: fractary-file-get-url
description: Get a URL for a file in storage
---

# Get Url

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<path>` | Yes | path |
| `--expires-in` | No | expires in |
| `--source` | No | source |
| `--json` | No | json |
| `--context` | No | context |

## Execution

Get a URL for a file in storage using the CLI command `fractary-core file get-url`.

Examples:
- `fractary-core file get-url docs/file.pdf`
- `fractary-core file get-url archive/SPEC-001.md --source specs --expires-in 3600`
- `fractary-core file get-url data.json --json`
