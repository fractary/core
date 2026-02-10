---
name: fractary-work:issue-comment
allowed-tools: Bash(fractary-core work issue-comment:*)
description: Post a comment on an issue
model: claude-haiku-4-5
argument-hint: '<number> --body "<text>" [--json] [--context "<text>"]'
---

## Context

- Repository: !`gh repo view --json nameWithOwner -q .nameWithOwner`

## Your task

Post a comment on an issue using the CLI command `fractary-core work issue-comment`.

Parse arguments:
- number (required): Issue number
- --body (required): Comment text
- --json: Output as JSON for structured data

Examples:
- `fractary-core work issue-comment 123 --body "This is my comment"`
- `fractary-core work issue-comment 456 --body "Implementation complete" --json`

Execute in a single message. Do not use any other tools. Do not send any other text.
