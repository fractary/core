---
name: fractary-repo-commit-push-pr
description: Commit, push, and open a PR. Use when committing, pushing, and creating a PR in one step.
---

# Commit Push Pr

## Context

First gather current state:
- Run `git status`
- Run `git diff HEAD`
- Run `git branch --show-current`

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--work-id` | No | work id |
| `--context` | No | context |

## Execution

Based on the above changes:

1. If on main/master, create a feature branch:
   `fractary-core repo branch-create <name> --checkout`
2. Create a single commit with an appropriate message:
   `fractary-core repo commit --message "<message>" --type <type> --all`
3. Push the branch to origin:
   `fractary-core repo push --set-upstream`
4. Create a pull request:
   When `--work-id` is provided, remove any existing closing keyword line from the body
   (any line matching `/(closes|fixes|resolves):?\s*#\d+/i`, including bold variants),
   then append `\n\nCloses #<id>` as plain text at the end of the body before calling:
   `fractary-core repo pr-create --title "<title>" --body "<body with Closes #N appended>"`
   Without `--work-id`, call as normal:
   `fractary-core repo pr-create --title "<title>" --body "<body>"`
