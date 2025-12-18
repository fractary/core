---
name: fractary-repo:pull
description: Pull branches from remote repository with intelligent conflict handling
model: claude-haiku-4-5
argument-hint: '[branch_name] [--remote <name>] [--rebase] [--strategy <strategy>] [--allow-switch]'
---

Pull Git branches from remote repository.

Use the **Task** tool to invoke agent `fractary-repo:pull`:
```
Task(
  subagent_type="fractary-repo:pull",
  description="Pull branch from remote",
  prompt="Parse arguments and pull with merge or rebase options"
)
```

**Usage:**
```
/fractary-repo:pull
/fractary-repo:pull --rebase
/fractary-repo:pull develop --remote origin
```
