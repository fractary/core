---
name: fractary-repo:branch-create
description: Create a new Git branch with semantic naming or direct branch name
model: claude-haiku-4-5
argument-hint: '["<branch-name-or-description>"] [--base <branch>] [--prefix <prefix>] [--work-id <id>] [--worktree] [--spec-create]'
---

Create a Git branch from work items, descriptions, or direct names.

Use the **Task** tool to invoke agent `fractary-repo:branch-create`:
```
Task(
  subagent_type="fractary-repo:branch-create",
  description="Create branch",
  prompt="Parse arguments and create branch with flexible naming modes"
)
```

**Usage:**
```
/fractary-repo:branch-create feature/my-new-feature
/fractary-repo:branch-create "add CSV export" --work-id 123
/fractary-repo:branch-create --work-id 123 --spec-create
```
