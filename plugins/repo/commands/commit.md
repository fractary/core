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

Use the **Bash** tool for each step below. Do NOT use the Skill tool.

Based on the above changes, create a single git commit:

1. Analyze the diff to determine an appropriate commit message and type
2. Stage and commit:
   `fractary-core repo commit --message "..." --type <type> --all`

Valid types: feat, fix, chore, docs, style, refactor, test, build

You MUST use the Bash tool for all commands above. Do NOT use the Skill tool. Execute all steps in a single message.
