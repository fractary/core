---
name: fractary-repo:pr-merge
description: Merge a pull request
model: claude-haiku-4-5
argument-hint: '<pr_number> [--strategy <strategy>] [--delete-branch] [--worktree-cleanup]'
---

Merge a pull request with configurable merge strategy.

Use the **Task** tool to invoke agent `fractary-repo:pr-merge`:
```
Task(
  subagent_type="fractary-repo:pr-merge",
  description="Merge pull request",
  prompt="Parse arguments and merge PR"
)
```

**Usage:**
```
/fractary-repo:pr-merge 42
/fractary-repo:pr-merge 42 --strategy squash --delete-branch
/fractary-repo:pr-merge 42 --worktree-cleanup
```
