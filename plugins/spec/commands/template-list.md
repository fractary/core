---
name: fractary-spec:template-list
description: List available specification templates - delegates to template-lister agent
allowed-tools: Task(fractary-spec:template-lister)
model: claude-haiku-4-5
argument-hint: '[--json]'
---

Use **Task** tool with `fractary-spec:template-lister` agent to list available specification templates.

```
Task(
  subagent_type="fractary-spec:template-lister",
  description="List specification templates",
  prompt="List available specification templates: $ARGUMENTS"
)
```
