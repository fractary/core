---
name: fractary-logs:archive
allowed-tools: Bash(fractary-core logs archive:*)
description: Archive old logs
model: claude-haiku-4-5
argument-hint: '[--max-age <days>] [--compress] [--json] [--context "<text>"]'
---

## Your task

Archive old logs using the CLI command `fractary-core logs archive`.

Parse arguments:
- --max-age: Archive logs older than N days (default: 90)
- --compress: Compress archived logs
- --json: Output as JSON for structured data

Examples:
- `fractary-core logs archive`
- `fractary-core logs archive --max-age 30 --compress --json`
- `fractary-core logs archive --max-age 60 --json`

You have the capability to call multiple tools in a single response. Execute the archive operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
