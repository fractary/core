---
name: fractary-docs-audit
description: Audit documentation quality
allowed-tools: Skill(fractary-docs-quality), Bash, Read, Glob
model: claude-sonnet-4-6
argument-hint: '[directory] [--doc-type <type>]'
---

Use the **Skill** tool with `fractary-docs-quality` in audit mode.

```
Skill(
  skill="fractary-docs-quality",
  args="audit $ARGUMENTS"
)
```
