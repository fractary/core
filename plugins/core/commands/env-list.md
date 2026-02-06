---
name: fractary-core:env-list
allowed-tools: Bash(fractary-core config env-list:*)
description: List available environments
model: claude-haiku-4-5
argument-hint: '[--context "<text>"]'
---

## Your task

List available environments using the CLI command `fractary-core config env-list`.

Shows all `.env` files found in the project root and indicates the currently active environment.

Examples:
- List environments: `fractary-core config env-list`

You have the capability to call multiple tools in a single response. Execute the list operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
