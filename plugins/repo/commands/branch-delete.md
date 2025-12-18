---
name: fractary-repo:branch-delete
description: Delete a Git branch (local, remote, or both)
model: claude-haiku-4-5
argument-hint: '[branch_name] [--location <local|remote|both>] [--force] [--worktree-cleanup]'
---

Delete a Git branch from local, remote, or both locations.

Invokes the **branch-delete** agent to handle deletion with safety checks.

**Usage:**
```
/fractary-repo:branch-delete feature/old-branch
/fractary-repo:branch-delete feature/123 --location both --force
```
