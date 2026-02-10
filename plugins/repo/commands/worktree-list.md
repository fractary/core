---
name: fractary-repo:worktree-list
allowed-tools: Bash(fractary-core repo worktree-list:*)
description: List all git worktrees with metadata
model: claude-haiku-4-5
argument-hint: '[--json] [--context "<text>"]'
---

## Your task

List all git worktrees using the CLI command `fractary-core repo worktree-list`.

Parse arguments:
- --json: Output as JSON for structured data

Examples:
- `fractary-core repo worktree-list`
- `fractary-core repo worktree-list --json`

Execute in a single message. Do not use any other tools. Do not send any other text.
