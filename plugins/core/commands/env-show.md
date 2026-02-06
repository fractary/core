---
name: fractary-core:env-show
allowed-tools: Bash(fractary-core config env-show:*)
description: Show current environment status and credential availability
model: claude-haiku-4-5
argument-hint: '[--context "<text>"]'
---

## Your task

Show the current environment status using the CLI command `fractary-core config env-show`.

Displays the active environment and credential status (with values masked).

Examples:
- Show environment: `fractary-core config env-show`

You have the capability to call multiple tools in a single response. Execute the show operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
