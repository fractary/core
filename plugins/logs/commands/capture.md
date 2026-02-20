---
name: fractary-logs:capture
allowed-tools: Bash(fractary-core logs capture:*)
description: Start session capture
model: claude-haiku-4-5
argument-hint: '<issue_number> [--model <model>] [--json] [--context "<text>"]'
---

## Your task

Start a session capture using the CLI command `fractary-core logs capture`.

Parse arguments:
- issue_number (required): Issue number to associate with session
- --model: Model being used
- --json: Output as JSON for structured data

Examples:
- `fractary-core logs capture 42`
- `fractary-core logs capture 15 --model claude-sonnet-4-6 --json`
- `fractary-core logs capture 99 --json`

You have the capability to call multiple tools in a single response. Execute the capture operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
