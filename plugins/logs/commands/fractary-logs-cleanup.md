---
name: fractary-logs-cleanup
description: Cleanup logs - delegates to fractary-logs-cleanup agent
allowed-tools: Agent(fractary-logs-cleanup)
model: claude-haiku-4-5
argument-hint: '[--older-than <days>] [--dry-run] [--context "<text>"]'
---

Use **Agent** tool with `fractary-logs-cleanup` agent to archive and clean up old logs.

```
Agent(
  subagent_type="fractary-logs-cleanup",
  description="Cleanup logs",
  prompt="Archive and clean up old logs: $ARGUMENTS"
)
```
