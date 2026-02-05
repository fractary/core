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
- Dry run: `fractary-core repo worktree-cleanup --dry-run`
- Cleanup merged: `fractary-core repo worktree-cleanup --merged`
- JSON output: `fractary-core repo worktree-cleanup --json`
- Full cleanup: `fractary-core repo worktree-cleanup`

You have the capability to call multiple tools in a single response. Execute the worktree cleanup in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
