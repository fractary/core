---
name: fractary-docs:list
description: List documentation files - delegates to fractary-docs:docs-list agent
allowed-tools: Task(fractary-docs:docs-list)
model: claude-haiku-4-5
argument-hint: '[directory] [--doc-type <type>] [--status <status>] [--format <format>] [--context "<text>"]'
---

Use **Task** tool with `fractary-docs:docs-list` agent to list and filter documentation files.

```
Task(
  subagent_type="fractary-docs:docs-list",
  description="List documentation files",
  prompt="List and filter documentation files: $ARGUMENTS"
)
```
