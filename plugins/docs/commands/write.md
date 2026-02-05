---
name: fractary-docs:write
description: Write documentation - delegates to fractary-docs:docs-writer agent
allowed-tools: Task(fractary-docs:docs-writer)
model: claude-haiku-4-5
argument-hint: '<doc_type> [file_path] [--skip-validation] [--batch] [--context "<text>"]'
---

Use **Task** tool with `fractary-docs:docs-writer` agent to create or update documentation.

```
Task(
  subagent_type="fractary-docs:docs-writer",
  description="Write documentation",
  prompt="Create or update documentation: $ARGUMENTS"
)
```
