---
name: fractary-file-test-connection
description: Test storage connection
allowed-tools: Bash(fractary-core file test-connection:*)
model: claude-haiku-4-5
argument-hint: '[--source <name>] [--json]'
---

## Your task

Test storage connectivity using the CLI command `fractary-core file test-connection`.

Parse arguments:
- --source: Named source to test (tests default if not specified)
- --json: Output as JSON

Call: `fractary-core file test-connection [--source <name>] [--json]`

Execute the CLI command and return the result.
