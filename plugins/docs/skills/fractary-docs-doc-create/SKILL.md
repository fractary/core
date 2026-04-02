---
name: fractary-docs-doc-create
description: Create a new document. Use when creating a new document.
---

# Doc Create

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | id |
| `--doc-type` | No | doc type |
| `--json` | No | json |
| `--context` | No | context |
| `--title` | Yes | title |
| `--content` | Yes | content |

## Execution

Create a new document using the CLI command `fractary-core docs doc-create`.

If title or content not provided in arguments, generate them from the conversation context.

Examples:
- `fractary-core docs doc-create guide-001 --title "User Guide" --content "Getting started..." --doc-type guides`
- `fractary-core docs doc-create adr-001 --title "Use PostgreSQL" --content "## Decision..." --doc-type adr --json`
- `fractary-core docs doc-create readme --title "README" --content "# Project" --json`
