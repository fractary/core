---
name: fractary-repo-commit-push
description: Commit and push. Use when committing and pushing changes in one step.
---

# Commit Push

## Context

First gather current state:
- Run `git status`
- Run `git diff HEAD`
- Run `git branch --show-current`

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--context` | No | context |

## Execution

Based on the above changes:

1. If on main/master, create a feature branch:
   `fractary-core repo branch-create <name> --checkout`
2. Create a single commit with an appropriate message:
   `fractary-core repo commit --message "<message>" --type <type> --all`
3. Push the branch to origin:
   `fractary-core repo push --set-upstream`
