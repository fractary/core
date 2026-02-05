---
name: fractary-repo:commit
allowed-tools: Bash(fractary-core repo commit:*)
description: Create a git commit
model: claude-haiku-4-5
argument-hint: '[--context "<text>"]'
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`

## Your task

Based on the above changes, create a single git commit using `fractary-core repo commit`.

1. Analyze the diff to determine an appropriate commit message and type
2. Stage and commit: `fractary-core repo commit --message "..." --type <type> --all`

Valid types: feat, fix, chore, docs, style, refactor, test, build

You have the capability to call multiple tools in a single response. Execute the commit in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
