---
name: fractary-docs:refine
description: Refine a document - delegates to fractary-docs:docs-refiner agent
allowed-tools: Task(fractary-docs:docs-refiner)
model: claude-haiku-4-5
argument-hint: '<id> [--context "<text>"]'
---

Use **Task** tool with `fractary-docs:docs-refiner` agent to refine a document through gap scanning and interactive Q&A.

```
Task(
  subagent_type="fractary-docs:docs-refiner",
  description="Refine document",
  prompt="Refine document through gap scanning and interactive Q&A: $ARGUMENTS"
)
```
