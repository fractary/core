---
name: fractary-logs:log
description: Log message - delegates to fractary-logs:logs-log agent
allowed-tools: Task(fractary-logs:logs-log)
model: claude-haiku-4-5
argument-hint: '<issue_number> "<message>" [--context "<text>"]'
---

Use **Task** tool with `fractary-logs:logs-log` agent to log messages to an issue's log.

```
Task(
  subagent_type="fractary-logs:logs-log",
  description="Log message",
  prompt="Log message to issue: $ARGUMENTS"
)
```
