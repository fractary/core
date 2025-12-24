---
name: fractary-work:issue-update
allowed-tools: Bash(gh issue edit:*)
description: Update issue
model: claude-haiku-4-5
argument-hint: '<number> [--title "<title>"] [--body "<text>"]'
---

## Context

- Repository: !`gh repo view --json nameWithOwner -q .nameWithOwner`

## Your task

Update issue using `gh issue edit`.

Parse arguments:
- number (required): Issue number
- --title: New title
- --body: New body/description

Example: `gh issue edit 123 --title "Updated title" --body "Updated description"`

Note: You can update title only, body only, or both.

You have the capability to call multiple tools in a single response. Execute the update operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
