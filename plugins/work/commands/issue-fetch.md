---
name: fractary-work:issue-fetch
allowed-tools: Bash(fractary-core work issue-fetch:*)
description: Fetch issue details
model: claude-haiku-4-5
argument-hint: '<number> [--verbose] [--json] [--context "<text>"]'
---

## Your task

Fetch issue details using the CLI command `fractary-core work issue-fetch`.

Parse arguments:
- number (required): Issue number
- --verbose: Show additional details (labels, assignees)
- --json: Output as JSON for structured data

Examples:
- Basic view: `fractary-core work issue-fetch 123`
- Verbose: `fractary-core work issue-fetch 123 --verbose`
- JSON output: `fractary-core work issue-fetch 123 --json`

You have the capability to call multiple tools in a single response. Execute the fetch operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
