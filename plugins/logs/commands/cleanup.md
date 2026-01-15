---
name: fractary-logs:cleanup
description: Cleanup logs - delegates to fractary-logs:logs-cleanup agent
allowed-tools: Task(fractary-logs:logs-cleanup)
model: claude-haiku-4-5
argument-hint: '[--older-than <days>] [--dry-run] [--context "<text>"]'
---

Use **Task** tool with `fractary-logs:logs-cleanup` agent to archive and clean up old logs.

```
Task(
  subagent_type="fractary-logs:logs-cleanup",
  description="Cleanup logs",
  prompt="Archive and clean up old logs: $ARGUMENTS"
)
```
