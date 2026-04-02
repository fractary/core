---
name: fractary-file-upload
description: Upload a file to storage
allowed-tools: Bash(fractary-core file upload:*)
model: claude-haiku-4-5
argument-hint: '<local-path> [--source <name>] [--remote-path <path>] [--json]'
---

## Your task

Upload a local file to storage using the CLI command `fractary-core file upload`.

Parse arguments:
- local-path (required): Path to local file to upload
- --remote-path: Remote storage path (defaults to filename)
- --source: Named source from config (e.g., specs, logs)
- --json: Output as JSON

Call: `fractary-core file upload <local-path> [--remote-path <path>] [--source <name>] [--json]`

Execute the CLI command and return the result.
