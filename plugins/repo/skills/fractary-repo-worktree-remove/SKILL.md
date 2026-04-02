---
name: fractary-repo-worktree-remove
description: Safely remove a git worktree. Use when removing a git worktree.
---

# Worktree Remove

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<path>` | Yes | path |
| `--force` | No | force |
| `--json` | No | json |
| `--context` | No | context |

## Execution

Remove a git worktree using the CLI command `fractary-core repo worktree-remove`.

Examples:
- `fractary-core repo worktree-remove ../project-123`
- `fractary-core repo worktree-remove ../project-123 --force`

Execute in a single message. Do not use any other tools. Do not send any other text.
