---
name: fractary-core:config-show
allowed-tools: Bash(fractary-core config show:*)
description: Display Fractary Core configuration (redacted)
model: claude-haiku-4-5
argument-hint: '[--json] [--context "<text>"]'
---

## Your task

Display the Fractary Core configuration using the CLI command `fractary-core config show`.

Sensitive values (tokens, keys, secrets) are automatically redacted.

Examples:
- Show config: `fractary-core config show`

You have the capability to call multiple tools in a single response. Execute the show operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
