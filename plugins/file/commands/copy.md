---
name: fractary-file:copy
allowed-tools: Bash(fractary-core file copy:*)
description: Copy a file within storage
model: claude-haiku-4-5
argument-hint: '<src-path> <dest-path> [--source <name>] [--json] [--context "<text>"]'
---

## Your task

Copy a file within storage using the CLI command `fractary-core file copy`.

Parse arguments:
- src-path (required): Source storage path
- dest-path (required): Destination storage path
- --source: Named source from config (e.g., specs, logs)
- --json: Output as JSON for structured data

Examples:
- `fractary-core file copy docs/file.txt docs/file-backup.txt`
- `fractary-core file copy archive/SPEC-001.md archive/SPEC-001-copy.md --source specs`
- `fractary-core file copy data.json data-backup.json --json`

You have the capability to call multiple tools in a single response. Execute the copy operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
