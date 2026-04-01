---
name: fractary-docs-refine
description: Refine a document through gap scanning and interactive Q&A
allowed-tools: Skill(fractary-docs-refiner), Bash, Read, Write, AskUserQuestion
model: claude-opus-4-6
argument-hint: '<id> [--context "<text>"]'
---

Use the **Skill** tool with `fractary-docs-refiner` to refine a document.

```
Skill(
  skill="fractary-docs-refiner",
  args="$ARGUMENTS"
)
```
