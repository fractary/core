---
name: fractary-file:move
allowed-tools: Bash(fractary-core file move:*)
description: Move a file within storage
model: claude-haiku-4-5
argument-hint: '<src-path> <dest-path> [--source <name>] [--json] [--context "<text>"]'
---

## Your task

Move a file within storage using the CLI command `fractary-core file move`.

Parse arguments:
- src-path (required): Source storage path
- dest-path (required): Destination storage path
- --source: Named source from config (e.g., specs, logs)
- --json: Output as JSON for structured data

Examples:
- `fractary-core file move docs/file.txt archive/file.txt`
- `fractary-core file move temp/SPEC-001.md archive/SPEC-001.md --source specs`
- `fractary-core file move old.json new.json --json`

You have the capability to call multiple tools in a single response. Execute the move operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
