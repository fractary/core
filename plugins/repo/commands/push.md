---
name: fractary-repo:push
description: Push branches to remote repository with safety checks
model: claude-haiku-4-5
argument-hint: '[branch_name] [--remote <name>] [--set-upstream] [--force]'
---

Push Git branches to remote repository.

Invokes the **push** agent to handle pushing with safety checks.

**Usage:**
```
/fractary-repo:push
/fractary-repo:push --set-upstream
/fractary-repo:push feature/123 --remote origin
```
