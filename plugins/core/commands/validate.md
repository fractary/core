---
name: fractary-core:validate
allowed-tools: Bash(fractary-core config validate:*)
description: Validate Fractary Core configuration
model: claude-haiku-4-5
argument-hint: '[--verbose] [--json] [--context "<text>"]'
---

## Your task

Validate the Fractary Core configuration using the CLI command `fractary-core config validate`.

Parse arguments:
- --verbose: Show detailed output including redacted config
- --json: Output as JSON for structured data

Examples:
- Basic validation: `fractary-core config validate`
- Verbose: `fractary-core config validate --verbose`

You have the capability to call multiple tools in a single response. Execute the validation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
