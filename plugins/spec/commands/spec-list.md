---
name: fractary-spec:spec-list
description: List specifications - delegates to spec-lister agent
allowed-tools: Task(fractary-spec:spec-lister)
model: claude-haiku-4-5
argument-hint: '[--status <status>] [--work-id <id>] [--json]'
---

Use **Task** tool with `fractary-spec:spec-lister` agent to list specifications.

```
Task(
  subagent_type="fractary-spec:spec-lister",
  description="List specifications",
  prompt="List specifications: $ARGUMENTS"
)
```
