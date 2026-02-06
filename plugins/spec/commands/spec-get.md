---
name: fractary-spec:spec-get
description: Get specification details - delegates to spec-getter agent
allowed-tools: Task(fractary-spec:spec-getter)
model: claude-haiku-4-5
argument-hint: '<id> [--json]'
---

Use **Task** tool with `fractary-spec:spec-getter` agent to retrieve specification details.

```
Task(
  subagent_type="fractary-spec:spec-getter",
  description="Get specification",
  prompt="Get specification details: $ARGUMENTS"
)
```
