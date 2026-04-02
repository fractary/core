---
name: fractary-repo-branch-forward
allowed-tools: Bash(fractary-core repo branch-forward:*)
description: Forward (merge) a source branch into a target branch via git merge. PR remains open.
model: claude-haiku-4-5
argument-hint: '--target <branch> [--source <branch>] [--create-from <branch>] [--push] [--json] [--context "<text>"]'
---

## Your task

Forward (merge) a source branch into a target branch using the CLI command `fractary-core repo branch-forward`.

Parse arguments:
- --target (required): Branch to merge into
- --source: Branch to merge from (default: current branch)
- --create-from: Create target from this base if it doesn't exist
- --push: Push target branch after merge
- --json: Output as JSON for structured data

Examples:
- `fractary-core repo branch-forward --target test --create-from main --push --json`
- `fractary-core repo branch-forward --target staging --source feature/123 --push`

Execute in a single message. Do not use any other tools. Do not send any other text.
