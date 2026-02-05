---
name: fractary-work:issue-update
allowed-tools: Bash(fractary-core work issue-update:*)
description: Update issue
model: claude-haiku-4-5
argument-hint: '<number> [--title "<title>"] [--body "<text>"] [--state <state>] [--json] [--context "<text>"]'
---

## Your task

Update an issue using the CLI command `fractary-core work issue-update`.

Parse arguments:
- number (required): Issue number
- --title: New title
- --body: New body/description
- --state: New state (open, closed)
- --json: Output as JSON for structured data

Note: You can update title only, body only, state only, or any combination.

Examples:
- `fractary-core work issue-update 123 --title "Updated title"`
- `fractary-core work issue-update 123 --body "Updated description"`
- `fractary-core work issue-update 123 --title "New title" --body "New body" --json`

You have the capability to call multiple tools in a single response. Execute the update operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
