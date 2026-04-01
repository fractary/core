---
name: fractary-docs-write
description: Write documentation
allowed-tools: Skill(fractary-docs-writer), Skill(fractary-docs-doc-type-selector), Bash, Read, Write, AskUserQuestion
model: claude-sonnet-4-6
argument-hint: '<doc_type> [file_path] [--work-id <number>] [--skip-validation]'
---

Use the **Skill** tool with `fractary-docs-writer` to create or update documentation.

```
Skill(
  skill="fractary-docs-writer",
  args="$ARGUMENTS"
)
```
