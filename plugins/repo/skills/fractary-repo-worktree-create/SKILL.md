---
name: fractary-repo-worktree-create
description: Create a new git worktree for workflow execution. Use when creating a new git worktree.
---

# Worktree Create

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<branch>` | Yes | branch |
| `--work-id` | No | work id |
| `--path` | No | path |
| `--base` | No | base |
| `--no-checkout` | No | no checkout |
| `--json` | No | json |
| `--context` | No | context |

## Execution

Create a new git worktree using the CLI command `fractary-core repo worktree-create`.

Examples:
- `fractary-core repo worktree-create feature/123 --work-id 123`
- `fractary-core repo worktree-create feature/123 --work-id 123 --path ../project-123`
- `fractary-core repo worktree-create feature/123 --base develop --json`

Execute in a single message. Do not use any other tools. Do not send any other text.
