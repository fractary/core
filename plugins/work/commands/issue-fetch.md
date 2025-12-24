---
name: fractary-work:issue-fetch
allowed-tools: Bash(gh issue view:*)
description: Fetch issue details
model: claude-haiku-4-5
argument-hint: '<number>'
---

## Context

- Repository: !`gh repo view --json nameWithOwner -q .nameWithOwner`

## Your task

Fetch issue details using `gh issue view`.

Parse arguments:
- number (required): Issue number

Examples:
- Basic view: `gh issue view 123`
- With comments: `gh issue view 123 --comments`

You have the capability to call multiple tools in a single response. Execute the fetch operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
