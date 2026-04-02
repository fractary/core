---
name: fractary-file-download
description: Download a file from storage
allowed-tools: Bash(fractary-core file download:*)
model: claude-haiku-4-5
argument-hint: '<remote-path> [--source <name>] [--local-path <path>] [--json]'
---

## Your task

Download a file from storage using the CLI command `fractary-core file download`.

Parse arguments:
- remote-path (required): Remote storage path to download
- --local-path: Local destination path (defaults to filename)
- --source: Named source from config (e.g., specs, logs)
- --json: Output as JSON

Call: `fractary-core file download <remote-path> [--local-path <path>] [--source <name>] [--json]`

Execute the CLI command and return the result.
