---
name: fractary-logs:types
allowed-tools: Bash(fractary-core logs types:*)
description: List available log types
model: claude-haiku-4-5
argument-hint: '[--json] [--context "<text>"]'
---

## Your task

List available log types using the CLI command `fractary-core logs types`.

Parse arguments:
- --json: Output as JSON for structured data

Examples:
- `fractary-core logs types`
- `fractary-core logs types --json`

You have the capability to call multiple tools in a single response. Execute the list operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
