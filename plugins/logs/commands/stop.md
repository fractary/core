---
name: fractary-logs:stop
allowed-tools: Bash(fractary-core logs stop:*)
description: Stop session capture
model: claude-haiku-4-5
argument-hint: '[--json] [--context "<text>"]'
---

## Your task

Stop the active session capture using the CLI command `fractary-core logs stop`.

Parse arguments:
- --json: Output as JSON for structured data

Examples:
- `fractary-core logs stop`
- `fractary-core logs stop --json`

You have the capability to call multiple tools in a single response. Execute the stop operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
