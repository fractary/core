---
name: fractary-work:issue-search
allowed-tools: Bash(gh search issues:*), Bash(gh repo view:*)
description: Search issues
model: claude-haiku-4-5
argument-hint: '<query> [--state <state>] [--limit <n>]'
---

## Context

- Repository: !`gh repo view --json nameWithOwner -q .nameWithOwner`

## Your task

Search issues using `gh search issues`.

Parse arguments:
- query (required): Search keywords
- --state: Filter by state (open, closed)
- --limit: Maximum results (default: 30)

Example: `gh search issues "login bug" --repo OWNER/REPO --state open --limit 10`

Note: Use the repository from context to scope the search.

You have the capability to call multiple tools in a single response. Execute the search operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
