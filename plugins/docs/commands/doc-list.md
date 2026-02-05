---
name: fractary-docs:doc-list
allowed-tools: Bash(fractary-core docs doc-list:*)
description: List documents
model: claude-haiku-4-5
argument-hint: '[--category <category>] [--tags <tags>] [--format <format>] [--json] [--context "<text>"]'
---

## Your task

List documents using the CLI command `fractary-core docs doc-list`.

Parse arguments:
- --category: Filter by category
- --tags: Filter by tags (comma-separated)
- --format: Filter by format
- --json: Output as JSON for structured data

Examples:
- `fractary-core docs doc-list`
- `fractary-core docs doc-list --category guides --json`
- `fractary-core docs doc-list --tags "api,design" --json`

You have the capability to call multiple tools in a single response. Execute the list operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
