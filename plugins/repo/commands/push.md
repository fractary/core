---
name: fractary-repo:push
description: Push branches to remote repository with safety checks
model: claude-haiku-4-5
argument-hint: '[branch_name] [--remote <name>] [--set-upstream] [--force]'
---

Push Git branches to remote repository.

Use the **Task** tool to invoke agent `fractary-repo:push`:
```
Task(
  subagent_type="fractary-repo:push",
  description="Push branch to remote",
  prompt="Parse arguments and push with safety checks"
)
```

**Usage:**
```
/fractary-repo:push
/fractary-repo:push --set-upstream
/fractary-repo:push feature/123 --remote origin
```
