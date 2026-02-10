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

**IMPORTANT: The CLI binary is `fractary-core`, NOT `fractary`. Always use `fractary-core` as the command prefix.**

Use the **Bash** tool for each step below. Do NOT use the Skill tool.

Based on the above changes:

1. If on main/master, create a feature branch:
   `fractary-core repo branch-create <name> --checkout`
2. Create a single commit with an appropriate message:
   `fractary-core repo commit --message "<message>" --type <type> --all`
3. Push the branch to origin:
   `fractary-core repo push --set-upstream`

You MUST use the Bash tool for all commands above. Do NOT use the Skill tool. Execute all steps in a single message.
