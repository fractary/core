---
name: fractary-logs:read
description: Read logs - delegates to fractary-logs:logs-read agent
allowed-tools: Task(fractary-logs:logs-read)
model: claude-haiku-4-5
argument-hint: '<issue_number> [--type <type>] [--context "<text>"]'
---

Use **Task** tool with `fractary-logs:logs-read` agent to read log files.

```
Task(
  subagent_type="fractary-logs:logs-read",
  description="Read logs",
  prompt="Read log files: $ARGUMENTS"
)
```
