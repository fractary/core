---
name: fractary-docs:check-consistency
description: Check documentation consistency - delegates to fractary-docs:docs-check-consistency agent
allowed-tools: Task(fractary-docs:docs-check-consistency)
model: claude-haiku-4-5
argument-hint: '[--fix] [--targets <files>] [--base <ref>] [--context "<text>"]'
---

Use **Task** tool with `fractary-docs:docs-check-consistency` agent to check if documentation is consistent with code changes.

```
Task(
  subagent_type="fractary-docs:docs-check-consistency",
  description="Check documentation consistency",
  prompt="Check if documentation is consistent with code changes: $ARGUMENTS"
)
```
