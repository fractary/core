---
name: fractary-repo:commit-push-pr
allowed-tools: Bash(fractary-core repo branch-create:*), Bash(fractary-core repo commit:*), Bash(fractary-core repo push:*), Bash(fractary-core repo pr-create:*)
description: Commit, push, and open a PR
model: claude-haiku-4-5
argument-hint: '[--context "<text>"]'
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`

## Your task

Based on the above changes:

1. If on main/master, create a feature branch:
   `fractary-core repo branch-create <name> --checkout`
2. Create a single commit with an appropriate message:
   `fractary-core repo commit --message "..." --type <type> --all`
3. Push the branch to origin:
   `fractary-core repo push --set-upstream`
4. Create a pull request:
   `fractary-core repo pr-create --title "..." --body "..."`

You have the capability to call multiple tools in a single response. You MUST do all of the above in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
