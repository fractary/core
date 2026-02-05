---
name: fractary-spec:spec-refine
description: Refine specification - delegates to spec-refiner agent
allowed-tools: Task(fractary-spec:spec-refiner)
model: claude-haiku-4-5
argument-hint: '--work-id <id> [--context "<text>"]'
---

Use **Task** tool with `fractary-spec:spec-refiner` agent for critically reviewing and refining current or specified specification document.

```
Task(
  subagent_type="fractary-spec:spec-refiner",
  description="Refine specification",
  prompt="Critically review the current specification document to identify opportunities for improvement. Ask any clarifying questions and/or propose improvements using the AskUserQuestion tool: $ARGUMENTS"
)
```
