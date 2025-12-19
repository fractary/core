---
allowed-tools: Task(fractary-repo:commit)
description: Create semantic commits - delegates to fractary-repo:commit agent
model: claude-haiku-4-5
argument-hint: '["message"] [--type <type>] [--work-id <id>] [--scope <scope>] [--breaking] [--description "<text>"]'
---

Use **Task** tool with `fractary-repo:commit` subagent to create semantic commit:

```
Task(
  subagent_type="fractary-repo:commit",
  description="Create semantic commit",
  prompt="Create semantic commit with arguments: $ARGUMENTS"
)
```
