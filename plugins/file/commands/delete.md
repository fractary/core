---
name: fractary-file:delete
allowed-tools: Bash(fractary-core file delete:*)
description: Delete a file from storage
model: claude-haiku-4-5
argument-hint: '<path> [--source <name>] [--json] [--context "<text>"]'
---

## Your task

Delete a file from storage using the CLI command `fractary-core file delete`.

Parse arguments:
- path (required): Remote storage path to delete
- --source: Named source from config (e.g., specs, logs)
- --json: Output as JSON for structured data

Examples:
- `fractary-core file delete docs/old-file.txt`
- `fractary-core file delete archive/SPEC-001.md --source specs`
- `fractary-core file delete temp/data.json --json`

You have the capability to call multiple tools in a single response. Execute the delete operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
