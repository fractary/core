---
name: fractary-docs:doc-get
allowed-tools: Bash(fractary-core docs doc-get:*)
description: Get a document by ID
model: claude-haiku-4-5
argument-hint: '<id> [--json] [--context "<text>"]'
---

## Your task

Get a document using the CLI command `fractary-core docs doc-get`.

Parse arguments:
- id (required): Document ID
- --json: Output as JSON for structured data

Examples:
- `fractary-core docs doc-get guide-001`
- `fractary-core docs doc-get adr-001 --json`

You have the capability to call multiple tools in a single response. Execute the get operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
