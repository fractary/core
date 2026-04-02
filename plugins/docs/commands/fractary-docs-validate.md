---
name: fractary-docs-validate
description: Validate documentation against type-specific rules
allowed-tools: Skill(fractary-docs-quality), Bash, Read, Glob
model: claude-haiku-4-5
argument-hint: '[file_path|pattern] [doc_type]'
---

Use the **Skill** tool with `fractary-docs-quality` in validate mode.

```
Skill(
  skill="fractary-docs-quality",
  args="validate $ARGUMENTS"
)
```
