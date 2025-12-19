---
name: fractary-repo:push
description: Push branches to remote - delegates to fractary-repo:push agent
allowed-tools: Task(fractary-repo:push)
model: claude-haiku-4-5
argument-hint: '[branch_name] [--remote <name>] [--set-upstream] [--force]'
---

Push branches to remote using Task tool:

```
Task(
  subagent_type="fractary-repo:push",
  description="Push branches to remote",
  prompt="Push branches to remote with arguments: $ARGUMENTS"
)
```
