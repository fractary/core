---
name: fractary-file:get-url
allowed-tools: Bash(fractary-core file get-url:*)
description: Get a URL for a file in storage
model: claude-haiku-4-5
argument-hint: '<path> [--expires-in <seconds>] [--source <name>] [--json] [--context "<text>"]'
---

## Your task

Get a URL for a file in storage using the CLI command `fractary-core file get-url`.

Parse arguments:
- path (required): Storage path
- --expires-in: URL expiration in seconds (for presigned URLs)
- --source: Named source from config (e.g., specs, logs)
- --json: Output as JSON for structured data

Examples:
- `fractary-core file get-url docs/file.pdf`
- `fractary-core file get-url archive/SPEC-001.md --source specs --expires-in 3600`
- `fractary-core file get-url data.json --json`

You have the capability to call multiple tools in a single response. Execute the get-url operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
