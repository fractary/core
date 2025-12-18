---
name: fractary-repo:worktree-list
description: List active worktrees with branch and work item information
model: claude-haiku-4-5
argument-hint: ''
---

List all Git worktrees in the repository.

Use the **Task** tool to invoke agent `fractary-repo:worktree-list`:
```
Task(
  subagent_type="fractary-repo:worktree-list",
  description="List worktrees",
  prompt="List all worktrees"
)
```

**Usage:**
```
/fractary-repo:worktree-list
```
