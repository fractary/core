---
name: fractary-work:issue-comment
allowed-tools: Bash(fractary-core work issue-comment:*)
description: Post a comment on an issue
model: claude-haiku-4-5
argument-hint: '<number> --body "<text>" [--json] [--context "<text>"]'
---

## Your task

Post a comment on an issue using the CLI command `fractary-core work issue-comment`.

Parse arguments:
- number (required): Issue number
- --body (required): Comment text
- --json: Output as JSON for structured data
- --context (optional): Additional instructions or context for the operation

Examples:
- `fractary-core work issue-comment 123 --body "This is my comment"`
- `fractary-core work issue-comment 456 --body "Implementation complete" --json`

You have the capability to call multiple tools in a single response. Execute the comment operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
