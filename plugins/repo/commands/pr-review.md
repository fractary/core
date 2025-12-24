---
allowed-tools: Bash(gh pr review:*), Bash(gh pr view:*), Bash(gh pr diff:*)
description: Review pull requests
model: claude-haiku-4-5
argument-hint: '<pr_number> [--approve|--request-changes|--comment] [--body "<text>"]'
---

## Context

- Repository: !`gh repo view --json nameWithOwner -q .nameWithOwner`

## Your task

Review pull request using `gh pr review`.

Actions:
- No flag or --comment: Just comment (analyze mode)
- --approve: Approve the PR
- --request-changes: Request changes

If no action specified, use `gh pr view <number>` and `gh pr diff <number>` to analyze first.

Example: `gh pr review 42 --approve --body "LGTM!"`

You have the capability to call multiple tools in a single response. Execute the review operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
