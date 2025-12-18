---
name: fractary-repo:pr-merge
description: Merge a pull request
model: claude-haiku-4-5
argument-hint: '<pr_number> [--strategy <strategy>] [--delete-branch] [--worktree-cleanup]'
---

Merge a pull request with configurable merge strategy.

Invokes the **pr-merge** agent to handle merging.

**Usage:**
```
/fractary-repo:pr-merge 42
/fractary-repo:pr-merge 42 --strategy squash --delete-branch
/fractary-repo:pr-merge 42 --worktree-cleanup
```
