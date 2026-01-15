---
name: fractary-spec:validate
description: Validate specification - delegates to fractary-spec:spec-validate agent
allowed-tools: Task(fractary-spec:spec-validate)
model: claude-haiku-4-5
argument-hint: '<issue_number> [--phase <n>] [--context "<text>"]'
---

Use **Task** tool with `fractary-spec:spec-validate` agent to validate implementation against specification.

```
Task(
  subagent_type="fractary-spec:spec-validate",
  description="Validate specification",
  prompt="Validate implementation against specification: $ARGUMENTS"
)
```
