---
name: fractary-work:issue-list
allowed-tools: Bash(gh issue list:*)
description: List issues
model: claude-haiku-4-5
argument-hint: '[--state <open|closed|all>] [--label <label>] [--assignee <user>] [--limit <n>] [--context "<text>"]'
---

## Context

- Repository: !`gh repo view --json nameWithOwner -q .nameWithOwner`

## Your task

List issues using `gh issue list`.

Parse arguments:
- --state: open, closed, or all (default: open)
- --label: filter by label
- --assignee: filter by assignee (@me for current user)
- --limit: maximum results (default: 30)

Example: `gh issue list --state open --label bug --assignee @me --limit 10`

You have the capability to call multiple tools in a single response. Execute the list operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
