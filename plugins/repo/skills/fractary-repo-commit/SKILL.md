---
name: fractary-repo-commit
description: Create a git commit. Use when creating a git commit from current changes.
---

# Commit

## Context

First gather current state:
- Run `git status`
- Run `git diff HEAD`
- Run `git branch --show-current`
- Run `git log --oneline -10`

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--context` | No | context |

## Execution

Based on the above changes, create a single git commit:

1. Analyze the diff to determine an appropriate commit message and type
2. Stage and commit:
   `fractary-core repo commit --message "..." --type <type> --all`

Valid types: feat, fix, chore, docs, style, refactor, test, build
