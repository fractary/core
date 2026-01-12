---
name: fractary-logs:archive
description: Archive logs - delegates to fractary-logs:logs-archive agent
allowed-tools: Task(fractary-logs:logs-archive)
model: claude-haiku-4-5
argument-hint: '<issue_number> [--force] [--retry] [--context "<text>"]'
---

Use **Task** tool with `fractary-logs:logs-archive` agent to archive issue logs to cloud storage.

```
Task(
  subagent_type="fractary-logs:logs-archive",
  description="Archive logs",
  prompt="Archive logs for issue: $ARGUMENTS"
)
```
