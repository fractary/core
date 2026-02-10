---
name: fractary-repo:worktree-remove
allowed-tools: Bash(fractary-core repo worktree-remove:*)
description: Safely remove a git worktree
model: claude-haiku-4-5
argument-hint: '<path> [--force] [--json] [--context "<text>"]'
---

## Your task

Remove a git worktree using the CLI command `fractary-core repo worktree-remove`.

Parse arguments:
- path (required): Path to worktree to remove
- --force: Force removal even with uncommitted changes
- --json: Output as JSON for structured data

Examples:
- `fractary-core repo worktree-remove ../project-123`
- `fractary-core repo worktree-remove ../project-123 --force`

Execute in a single message. Do not use any other tools. Do not send any other text.
