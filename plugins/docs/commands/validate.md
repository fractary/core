---
name: fractary-docs:validate
description: Validate documentation - delegates to fractary-docs:docs-validator agent
allowed-tools: Task(fractary-docs:docs-validator)
model: claude-haiku-4-5
argument-hint: '[file_path|pattern] [doc_type] [--context "<text>"]'
---

Use **Task** tool with `fractary-docs:docs-validator` agent to validate documentation against type-specific rules.

```
Task(
  subagent_type="fractary-docs:docs-validator",
  description="Validate documentation",
  prompt="Validate documentation against type-specific rules: $ARGUMENTS"
)
```
