---
name: fractary-logs:type-info
allowed-tools: Bash(fractary-core logs type-info:*)
description: Get detailed information about a log type
model: claude-haiku-4-5
argument-hint: '<type> [--json] [--context "<text>"]'
---

## Your task

Get detailed information about a log type using the CLI command `fractary-core logs type-info`.

Parse arguments:
- type (required): Log type ID (e.g., session, build, deployment, test, debug, audit, operational, workflow, changelog)
- --json: Output as JSON for structured data

Examples:
- `fractary-core logs type-info session`
- `fractary-core logs type-info build --json`
- `fractary-core logs type-info deployment --json`

You have the capability to call multiple tools in a single response. Execute the type-info operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
