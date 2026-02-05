---
name: fractary-docs:doc-update
allowed-tools: Bash(fractary-core docs doc-update:*)
description: Update a document
model: claude-haiku-4-5
argument-hint: '<id> --content "<text>" [--title "<title>"] [--json] [--context "<text>"]'
---

## Your task

Update a document using the CLI command `fractary-core docs doc-update`.

Parse arguments:
- id (required): Document ID
- --content (required): New content
- --title: New title
- --tags: New tags (comma-separated)
- --category: New category
- --description: New description
- --json: Output as JSON for structured data

Examples:
- `fractary-core docs doc-update guide-001 --content "Updated guide content..." --json`
- `fractary-core docs doc-update adr-001 --content "Revised decision..." --title "Updated Title"`

You have the capability to call multiple tools in a single response. Execute the update operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
