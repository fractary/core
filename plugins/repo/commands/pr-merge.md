---
allowed-tools: Bash(gh pr merge:*), Bash(gh pr view:*)
description: Merge pull requests
model: claude-haiku-4-5
argument-hint: '<pr_number> [--squash|--merge|--rebase] [--delete-branch] [--context "<text>"]'
---

## Context

- Repository: !`gh repo view --json nameWithOwner -q .nameWithOwner`

## Your task

Merge pull request using `gh pr merge`.

Parse arguments:
- pr_number (required)
- strategy: --squash, --merge, or --rebase (default: merge)
- --delete-branch if requested

Example: `gh pr merge 42 --squash --delete-branch`

You have the capability to call multiple tools in a single response. Execute the merge operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
