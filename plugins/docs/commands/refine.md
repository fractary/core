---
name: fractary-docs-refine
description: Refine a document - delegates to fractary-docs-refiner agent
allowed-tools: Agent(fractary-docs-refiner)
model: claude-haiku-4-5
argument-hint: '<id> [--context "<text>"]'
---

Use **Agent** tool with `fractary-docs-refiner` agent to refine a document through gap scanning and interactive Q&A.

```
Agent(
  subagent_type="fractary-docs-refiner",
  description="Refine document",
  prompt="Refine document through gap scanning and interactive Q&A: $ARGUMENTS"
)
```
