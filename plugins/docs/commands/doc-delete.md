---
name: fractary-docs:doc-delete
allowed-tools: Bash(fractary-core docs doc-delete:*)
description: Delete a document
model: claude-haiku-4-5
argument-hint: '<id> [--json] [--context "<text>"]'
---

## Your task

Delete a document using the CLI command `fractary-core docs doc-delete`.

Parse arguments:
- id (required): Document ID
- --json: Output as JSON for structured data

Examples:
- `fractary-core docs doc-delete guide-001`
- `fractary-core docs doc-delete adr-001 --json`

You have the capability to call multiple tools in a single response. Execute the delete operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
