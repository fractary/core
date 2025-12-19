---
name: fractary-repo:worktree-cleanup
description: Clean up worktrees - delegates to fractary-repo:worktree-cleanup agent
allowed-tools: Task(fractary-repo:worktree-cleanup)
model: claude-haiku-4-5
argument-hint: '[--merged] [--stale] [--days <n>] [--dry-run]'
---

Delegates to fractary-repo:worktree-cleanup agent for cleaning up merged and stale worktrees.
