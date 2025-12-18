---
name: fractary-repo:worktree-remove
description: Remove a specific worktree safely
model: claude-haiku-4-5
argument-hint: '<branch_name> [--force]'
---

Remove a Git worktree.

Use the **Task** tool to invoke agent `fractary-repo:worktree-remove`:
```
Task(
  subagent_type="fractary-repo:worktree-remove",
  description="Remove worktree",
  prompt="Parse arguments and remove worktree"
)
```

**Usage:**
```
/fractary-repo:worktree-remove feature/123
/fractary-repo:worktree-remove feature/old --force
```
