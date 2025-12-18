---
name: fractary-repo:worktree-cleanup
description: Clean up merged and stale worktrees safely
model: claude-haiku-4-5
argument-hint: '[--merged] [--stale] [--days <n>] [--dry-run]'
---

Clean up merged or stale Git worktrees.

Use the **Task** tool to invoke agent `fractary-repo:worktree-cleanup`:
```
Task(
  subagent_type="fractary-repo:worktree-cleanup",
  description="Cleanup worktrees",
  prompt="Parse arguments and cleanup worktrees"
)
```

**Usage:**
```
/fractary-repo:worktree-cleanup
/fractary-repo:worktree-cleanup --merged --dry-run
/fractary-repo:worktree-cleanup --stale --days 30
```
