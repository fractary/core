---
name: fractary-repo-worktree-cleanup
description: Clean up stale and orphaned worktrees
---

# Worktree Cleanup

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--dry-run` | No | dry run |
| `--merged` | No | merged |
| `--stale` | No | stale |
| `--json` | No | json |
| `--context` | No | context |

## Execution

Clean up stale worktrees using the CLI command `fractary-core repo worktree-cleanup`.

Examples:
- `fractary-core repo worktree-cleanup --dry-run`
- `fractary-core repo worktree-cleanup --merged`
- `fractary-core repo worktree-cleanup --json`

Execute in a single message. Do not use any other tools. Do not send any other text.
