---
name: fractary-work:issue-comment
allowed-tools: Bash(gh issue comment:*), Bash(gh repo view:*)
description: Post a comment on an issue
model: claude-haiku-4-5
argument-hint: '<number> [--body "<text>"] [--context "<text>"]'
---

## Context

- Repository: !`gh repo view --json nameWithOwner -q .nameWithOwner`

## Your task

Post a comment on an issue using `gh issue comment`.

Parse arguments:
- number (required): Issue number
- --body (optional): Comment text. If omitted, gh will open an interactive editor
- --context (optional): Additional instructions or context for the operation

Examples:
- With body: `gh issue comment 123 --body "This is my comment"`
- Interactive: `gh issue comment 123` (opens editor)

You have the capability to call multiple tools in a single response. Execute the comment operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
