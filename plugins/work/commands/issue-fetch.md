---
name: fractary-work:issue-fetch
allowed-tools: Bash(fractary-core work issue-fetch:*)
description: Fetch issue details
model: claude-haiku-4-5
argument-hint: '<number> [--verbose] [--json] [--context "<text>"]'
---

## Context

- Repository: !`gh repo view --json nameWithOwner -q .nameWithOwner`

## Your task

Fetch issue details using the CLI command `fractary-core work issue-fetch`.

Parse arguments:
- number (required): Issue number
- --verbose: Show additional details (labels, assignees)
- --json: Output as JSON for structured data

Examples:
- `fractary-core work issue-fetch 123`
- `fractary-core work issue-fetch 123 --verbose`
- `fractary-core work issue-fetch 123 --json`

Execute in a single message. Do not use any other tools. Do not send any other text.
