---
name: fractary-repo:pull
description: Pull branches from remote repository with intelligent conflict handling
model: claude-haiku-4-5
argument-hint: '[branch_name] [--remote <name>] [--rebase] [--strategy <strategy>] [--allow-switch]'
---

Pull Git branches from remote repository.

Invokes the **pull** agent to handle pulling with merge or rebase options.

**Usage:**
```
/fractary-repo:pull
/fractary-repo:pull --rebase
/fractary-repo:pull develop --remote origin
```
