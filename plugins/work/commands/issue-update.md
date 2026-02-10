---
name: fractary-work:issue-update
allowed-tools: Bash(fractary-core work issue-update:*)
description: Update issue
model: claude-haiku-4-5
argument-hint: '<number> [--title "<title>"] [--body "<text>"] [--state <state>] [--json] [--context "<text>"]'
---

## Context

- Repository: !`gh repo view --json nameWithOwner -q .nameWithOwner`

## Your task

Update an issue using the CLI command `fractary-core work issue-update`.

Parse arguments:
- number (required): Issue number
- --title: New title
- --body: New body/description
- --state: New state (open, closed)
- --json: Output as JSON for structured data

Examples:
- `fractary-core work issue-update 123 --title "Updated title"`
- `fractary-core work issue-update 123 --state closed`
- `fractary-core work issue-update 123 --title "New title" --body "New body" --json`

Execute in a single message. Do not use any other tools. Do not send any other text.
