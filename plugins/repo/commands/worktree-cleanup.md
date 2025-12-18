---
name: fractary-repo:worktree-cleanup
description: Clean up merged and stale worktrees safely
model: claude-haiku-4-5
argument-hint: '[--merged] [--stale] [--days <n>] [--dry-run]'
---

Clean up merged or stale Git worktrees.

Invokes the **worktree-cleanup** agent to handle cleanup.

**Usage:**
```
/fractary-repo:worktree-cleanup
/fractary-repo:worktree-cleanup --merged --dry-run
/fractary-repo:worktree-cleanup --stale --days 30
```
