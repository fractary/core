---
name: fractary-docs-check-consistency
description: Check documentation consistency with code changes
allowed-tools: Skill(fractary-docs-quality), Bash, Read, Write, Glob
model: claude-sonnet-4-6
argument-hint: '[--fix] [--targets <files>] [--base <ref>] [--mode <confirm|auto|dry-run>]'
---

Use the **Skill** tool with `fractary-docs-quality` in check-consistency mode.

```
Skill(
  skill="fractary-docs-quality",
  args="check-consistency $ARGUMENTS"
)
```
