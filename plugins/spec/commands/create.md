---
name: fractary-spec:create
description: Create specification - delegates to fractary-spec:spec-create agent
allowed-tools: Task(fractary-spec:spec-create)
model: claude-opus-4-5
argument-hint: '[--work-id <id>] [--template <type>] [--force] [--context "<text>"]'
---

Use **Task** tool with `fractary-spec:spec-create` agent to create specification from conversational context and provided arguments.

```
Task(
  subagent_type="fractary-spec:spec-create",
  description="Create specification",
  prompt="Create plan / specification / product requirements document: $ARGUMENTS"
)
```