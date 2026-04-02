---
name: fractary-docs-doc-search
description: Search documents. Use when searching documents.
---

# Doc Search

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--text` | No | text |
| `--tags` | No | tags |
| `--doc-type` | No | doc type |
| `--json` | No | json |
| `--context` | No | context |

## Execution

Search documents using the CLI command `fractary-core docs doc-search`.

Examples:
- `fractary-core docs doc-search --text "authentication" --json`
- `fractary-core docs doc-search --doc-type adr --json`
- `fractary-core docs doc-search --tags "api,design" --limit 5 --json`
