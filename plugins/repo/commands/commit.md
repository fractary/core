---
name: fractary-repo:commit
description: Create semantic commits - delegates to fractary-repo:commit agent
allowed-tools: Task(fractary-repo:commit)
model: claude-haiku-4-5
argument-hint: '["message"] [--type <type>] [--work-id <id>] [--scope <scope>] [--breaking] [--description "<text>"]'
---

Create semantic commit using Task tool:

```
Task(
  subagent_type="fractary-repo:commit",
  description="Create semantic commit",
  prompt="Create semantic commit with arguments: $ARGUMENTS"
)
```
