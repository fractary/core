---
name: fractary-file:exists
allowed-tools: Bash(fractary-core file exists:*)
description: Check if a file exists in storage
model: claude-haiku-4-5
argument-hint: '<path> [--source <name>] [--json] [--context "<text>"]'
---

## Your task

Check if a file exists in storage using the CLI command `fractary-core file exists`.

Parse arguments:
- path (required): Storage path to check
- --source: Named source from config (e.g., specs, logs)
- --json: Output as JSON for structured data

Examples:
- `fractary-core file exists data.json`
- `fractary-core file exists archive/SPEC-001.md --source specs`
- `fractary-core file exists config.yaml --json`

You have the capability to call multiple tools in a single response. Execute the exists check in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
