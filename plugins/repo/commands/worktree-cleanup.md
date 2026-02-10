---
name: fractary-repo:worktree-cleanup
allowed-tools: Bash(fractary-core repo worktree-cleanup:*)
description: Clean up stale and orphaned worktrees
model: claude-haiku-4-5
argument-hint: '[--dry-run] [--merged] [--stale] [--json] [--context "<text>"]'
---

## Your task

Clean up stale worktrees using the CLI command `fractary-core repo worktree-cleanup`.

Parse arguments:
- --dry-run: Show what would be removed without removing
- --merged: Remove only merged worktrees
- --stale: Remove only stale worktrees
- --json: Output as JSON for structured data

Examples:
- `fractary-core repo worktree-cleanup --dry-run`
- `fractary-core repo worktree-cleanup --merged`
- `fractary-core repo worktree-cleanup --json`

Execute in a single message. Do not use any other tools. Do not send any other text.
