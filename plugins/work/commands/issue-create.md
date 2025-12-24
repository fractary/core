---
name: fractary-work:issue-create
allowed-tools: Bash(gh issue create:*), Bash(gh repo view:*), Bash(gh issue list:*)
description: Create new issue
model: claude-haiku-4-5
argument-hint: '[--title "<title>"] [--body "<text>"] [--label <label>] [--assignee <user>]'
---

## Context

- Repository: !`gh repo view --json nameWithOwner -q .nameWithOwner`
- Recent issues: !`gh issue list --limit 5`

## Your task

Create a new issue using `gh issue create`.

Parse arguments:
- --title: Issue title (or generate from conversation context)
- --body: Issue description (or generate from conversation context)
- --label: Labels to add (can specify multiple)
- --assignee: User to assign (@me for current user)

If title or body not provided in arguments, generate them from the conversation context.

Examples:
- `gh issue create --title "Bug: login timeout" --body "Users are logged out after 5 minutes" --label bug`
- `gh issue create --title "Feature: CSV export" --assignee @me --label feature`

You have the capability to call multiple tools in a single response. Execute the create operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
