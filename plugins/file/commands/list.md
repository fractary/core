---
name: fractary-file:list
allowed-tools: Bash(fractary-core file list:*)
description: List files in storage
model: claude-haiku-4-5
argument-hint: '[--prefix <prefix>] [--source <name>] [--json] [--context "<text>"]'
---

## Your task

List files in storage using the CLI command `fractary-core file list`.

Parse arguments:
- --prefix: Filter by path prefix
- --source: Named source from config (e.g., specs, logs)
- --json: Output as JSON for structured data

Examples:
- `fractary-core file list`
- `fractary-core file list --prefix docs/`
- `fractary-core file list --source specs --json`
- `fractary-core file list --prefix archive/ --source specs`

You have the capability to call multiple tools in a single response. Execute the list operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
