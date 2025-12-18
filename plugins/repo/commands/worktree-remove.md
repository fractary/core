---
name: fractary-repo:worktree-remove
description: Remove a specific worktree safely
model: claude-haiku-4-5
argument-hint: '<branch_name> [--force]'
---

Remove a Git worktree.

Invokes the **worktree-remove** agent to safely remove the worktree.

**Usage:**
```
/fractary-repo:worktree-remove feature/123
/fractary-repo:worktree-remove feature/old --force
```
