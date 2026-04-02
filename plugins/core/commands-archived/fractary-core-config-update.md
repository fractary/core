---
name: fractary-core-config-update
description: Update existing Fractary Core configuration incrementally
allowed-tools: Skill(fractary-core-config-updater), Bash, Read, Edit, Write, AskUserQuestion
model: claude-haiku-4-5
argument-hint: '--context "<description of changes>" [--plugins <list>] [--dry-run] [--yes]'
---

Use the **Skill** tool with `fractary-core-config-updater` to incrementally update existing configuration.

Interprets natural language descriptions and applies targeted changes while preserving unrelated sections.

```
Skill(
  skill="fractary-core-config-updater",
  args="$ARGUMENTS"
)
```
