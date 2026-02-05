---
name: fractary-docs:type-info
allowed-tools: Bash(fractary-core docs type-info:*)
description: Get detailed information about a document type
model: claude-haiku-4-5
argument-hint: '<type> [--template] [--standards] [--json] [--context "<text>"]'
---

## Your task

Get detailed information about a document type using the CLI command `fractary-core docs type-info`.

Parse arguments:
- type (required): Document type ID (e.g., adr, api, architecture)
- --template: Show the document template
- --standards: Show the documentation standards
- --json: Output as JSON for structured data

Examples:
- `fractary-core docs type-info adr`
- `fractary-core docs type-info api --template`
- `fractary-core docs type-info architecture --json`
- `fractary-core docs type-info guides --standards`

You have the capability to call multiple tools in a single response. Execute the type-info operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
