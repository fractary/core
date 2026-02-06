---
name: fractary-file:read
allowed-tools: Bash(fractary-core file read:*)
description: Read content from a storage path
model: claude-haiku-4-5
argument-hint: '<path> [--source <name>] [--json] [--context "<text>"]'
---

## Your task

Read content from a storage path using the CLI command `fractary-core file read`.

Parse arguments:
- path (required): Storage path to read
- --source: Named source from config (e.g., specs, logs)
- --json: Output as JSON for structured data

Examples:
- `fractary-core file read data.json`
- `fractary-core file read docs/notes.txt --source specs`
- `fractary-core file read config.yaml --json`

You have the capability to call multiple tools in a single response. Execute the read operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
