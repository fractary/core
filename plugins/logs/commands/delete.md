---
name: fractary-logs:delete
allowed-tools: Bash(fractary-core logs delete:*)
description: Delete a log entry
model: claude-haiku-4-5
argument-hint: '<id> [--json] [--context "<text>"]'
---

## Your task

Delete a log entry using the CLI command `fractary-core logs delete`.

Parse arguments:
- id (required): Log ID
- --json: Output as JSON for structured data

Examples:
- `fractary-core logs delete session-2026-01-15-abc123`
- `fractary-core logs delete build-2026-01-10-def456 --json`

You have the capability to call multiple tools in a single response. Execute the delete operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
