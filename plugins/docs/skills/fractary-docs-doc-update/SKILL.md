---
name: fractary-docs-doc-update
description: Update a document. Use when updating a document.
---

# Doc Update

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | id |
| `--title` | No | title |
| `--json` | No | json |
| `--context` | No | context |
| `--content` | Yes | content |

## Execution

Update a document using the CLI command `fractary-core docs doc-update`.

Examples:
- `fractary-core docs doc-update guide-001 --content "Updated guide content..." --json`
- `fractary-core docs doc-update adr-001 --content "Revised decision..." --title "Updated Title"`
