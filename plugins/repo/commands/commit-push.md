---
name: fractary-repo:commit-push
allowed-tools: Bash(fractary-core repo branch-create:*), Bash(fractary-core repo commit:*), Bash(fractary-core repo push:*)
description: Commit and push
model: claude-haiku-4-5
argument-hint: '[--context "<text>"]'
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`

## Your task

Based on the above changes:

1. If on main/master, create a feature branch using `fractary-core repo branch-create`
2. Create a single commit with an appropriate message using `fractary-core repo commit`
3. Push the branch to origin using `fractary-core repo push`

You have the capability to call multiple tools in a single response. You MUST do all of the above in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
