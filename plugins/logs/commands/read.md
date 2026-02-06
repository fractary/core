---
name: fractary-logs:read
allowed-tools: Bash(fractary-core logs read:*)
description: Read a log entry
model: claude-haiku-4-5
argument-hint: '<id> [--json] [--context "<text>"]'
---

## Your task

Read a log entry using the CLI command `fractary-core logs read`.

Parse arguments:
- id (required): Log ID
- --json: Output as JSON for structured data

Examples:
- `fractary-core logs read session-2026-01-15-abc123`
- `fractary-core logs read build-2026-01-10-def456 --json`

You have the capability to call multiple tools in a single response. Execute the read operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
