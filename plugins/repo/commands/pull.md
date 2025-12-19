---
name: fractary-repo:pull
description: Pull branches from remote - delegates to fractary-repo:pull agent
allowed-tools: Task(fractary-repo:pull)
model: claude-haiku-4-5
argument-hint: '[branch_name] [--remote <name>] [--rebase] [--strategy <strategy>] [--allow-switch]'
---

Pull branches from remote using Task tool:

```
Task(
  subagent_type="fractary-repo:pull",
  description="Pull branches from remote",
  prompt="Pull branches from remote with arguments: $ARGUMENTS"
)
```
