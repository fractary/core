---
name: fractary-repo:branch-delete
description: Delete a Git branch (local, remote, or both)
model: claude-haiku-4-5
argument-hint: '[branch_name] [--location <local|remote|both>] [--force] [--worktree-cleanup]'
---

Delete a Git branch from local, remote, or both locations.

Use the **Task** tool to invoke agent `fractary-repo:branch-delete`:
```
Task(
  subagent_type="fractary-repo:branch-delete",
  description="Delete branch {branch_name}",
  prompt="Parse arguments and delete the specified branch"
)
```

**Usage:**
```
/fractary-repo:branch-delete feature/old-branch
/fractary-repo:branch-delete feature/123 --location both --force
```
