---
name: fractary-work:issue-create
allowed-tools: Bash(fractary-core work issue-create:*)
description: Create new issue
model: claude-haiku-4-5
argument-hint: '--title "<title>" [--body "<text>"] [--labels <labels>] [--assignees <users>] [--json] [--context "<text>"]'
---

## Your task

Create a new issue using the CLI command `fractary-core work issue-create`.

Parse arguments:
- --title (required): Issue title
- --body: Issue description
- --labels: Comma-separated labels to add
- --assignees: Comma-separated users to assign
- --json: Output as JSON for structured data

If title or body not provided in arguments, generate them from the conversation context.

Examples:
- `fractary-core work issue-create --title "Bug: login timeout" --body "Users are logged out after 5 minutes" --labels bug`
- `fractary-core work issue-create --title "Feature: CSV export" --assignees user1 --labels feature`
- `fractary-core work issue-create --title "New feature" --json`

You have the capability to call multiple tools in a single response. Execute the create operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
