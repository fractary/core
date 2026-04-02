---
name: fractary-logs-cleanup
description: Clean up old logs based on age threshold
allowed-tools: Skill(fractary-logs-manager), Bash, Read
model: claude-haiku-4-5
argument-hint: '[--older-than <days>] [--dry-run]'
---

Use the **Skill** tool with `fractary-logs-manager` in cleanup mode.

```
Skill(
  skill="fractary-logs-manager",
  args="cleanup $ARGUMENTS"
)
```
