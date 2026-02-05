---
name: fractary-spec:spec-validate
description: Validate specification - delegates to spec-validator agent
allowed-tools: Task(fractary-spec:spec-validator)
model: claude-haiku-4-5
argument-hint: '<issue_number> [--phase <n>] [--context "<text>"]'
---

Use **Task** tool with `fractary-spec:spec-validator` agent to validate implementation against specification.

```
Task(
  subagent_type="fractary-spec:spec-validator",
  description="Validate specification",
  prompt="Validate implementation against specification: $ARGUMENTS"
)
```
