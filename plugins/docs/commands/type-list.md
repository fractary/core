---
name: fractary-docs:type-list
allowed-tools: Bash(fractary-core docs type-list:*)
description: List available document types
model: claude-haiku-4-5
argument-hint: '[--json] [--context "<text>"]'
---

## Your task

List available document types using the CLI command `fractary-core docs type-list`.

Parse arguments:
- --json: Output as JSON for structured data

Examples:
- `fractary-core docs type-list`
- `fractary-core docs type-list --json`

You have the capability to call multiple tools in a single response. Execute the list operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
