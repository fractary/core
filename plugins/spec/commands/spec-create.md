---
name: fractary-spec:spec-create
description: Create specification - delegates to spec-creator agent
allowed-tools: Task(fractary-spec:spec-creator)
model: claude-haiku-4-5
argument-hint: '[--work-id <id>] [--template <type>] [--force] [--context "<text>"]'
---

Use **Task** tool with `fractary-spec:spec-creator` agent to create specification from conversational context and provided arguments.

```
Task(
  subagent_type="fractary-spec:spec-creator",
  description="Create specification",
  prompt="Create plan / specification / product requirements document: $ARGUMENTS"
)
```
