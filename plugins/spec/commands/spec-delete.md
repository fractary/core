---
name: fractary-spec:spec-delete
description: Delete a specification - delegates to spec-deleter agent
allowed-tools: Task(fractary-spec:spec-deleter)
model: claude-haiku-4-5
argument-hint: '<id> [--json]'
---

Use **Task** tool with `fractary-spec:spec-deleter` agent to delete a specification.

```
Task(
  subagent_type="fractary-spec:spec-deleter",
  description="Delete specification",
  prompt="Delete specification: $ARGUMENTS"
)
```
