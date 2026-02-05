---
name: fractary-spec:spec-update
description: Update a specification - delegates to spec-updater agent
allowed-tools: Task(fractary-spec:spec-updater)
model: claude-haiku-4-5
argument-hint: '<id> [--title <title>] [--content <content>] [--work-id <id>] [--status <status>] [--json]'
---

Use **Task** tool with `fractary-spec:spec-updater` agent to update a specification.

```
Task(
  subagent_type="fractary-spec:spec-updater",
  description="Update specification",
  prompt="Update specification: $ARGUMENTS"
)
```
