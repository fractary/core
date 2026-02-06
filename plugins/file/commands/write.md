---
name: fractary-file:write
allowed-tools: Bash(fractary-core file write:*)
description: Write content to a storage path
model: claude-haiku-4-5
argument-hint: '<path> --content "<text>" [--source <name>] [--json] [--context "<text>"]'
---

## Your task

Write content to a storage path using the CLI command `fractary-core file write`.

Parse arguments:
- path (required): Storage path
- --content (required): Content to write
- --source: Named source from config (e.g., specs, logs)
- --json: Output as JSON for structured data

Examples:
- `fractary-core file write data.json --content '{"key":"value"}'`
- `fractary-core file write docs/notes.txt --content "Meeting notes" --source specs`
- `fractary-core file write config.yaml --content "version: 1.0" --json`

You have the capability to call multiple tools in a single response. Execute the write operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
