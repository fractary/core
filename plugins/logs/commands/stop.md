---
name: fractary-logs:stop
description: Stop session - delegates to fractary-logs:logs-stop agent
allowed-tools: Task(fractary-logs:logs-stop)
model: claude-haiku-4-5
argument-hint: '[--context "<text>"]'
---

Use **Task** tool with `fractary-logs:logs-stop` agent to stop active session capture.

```
Task(
  subagent_type="fractary-logs:logs-stop",
  description="Stop session",
  prompt="Stop active session capture: $ARGUMENTS"
)
```
