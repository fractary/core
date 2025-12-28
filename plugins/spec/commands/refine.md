---
name: fractary-spec:refine
description: Refine specification - delegates to fractary-spec:spec-refine agent
allowed-tools: Task(fractary-spec:spec-refine)
model: claude-opus-4-5
argument-hint: '--work-id <id> [--prompt "<focus>"]'
---

Delegates to fractary-spec:spec-refine agent for critically reviewing and refining specifications.


Use **Task** tool with `fractary-spec:spec-refine` agent for critically reviewing and refining current or specified specification document.

```
Task(
  subagent_type="fractary-spec:spec-refine",
  description="Refine specification",
  prompt="Critically review the current specification document to identify opportunities for improvement. Ask any clarifying questions and/or propose improvements using the AskUserQuestion tool: $ARGUMENTS"
)
```