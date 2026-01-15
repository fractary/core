---
name: fractary-logs:capture
description: Capture session - delegates to fractary-logs:logs-capture agent
allowed-tools: Task(fractary-logs:logs-capture)
model: claude-haiku-4-5
argument-hint: '<issue_number> [--context "<text>"]'
---

Use **Task** tool with `fractary-logs:logs-capture` agent to start conversation session capture.

```
Task(
  subagent_type="fractary-logs:logs-capture",
  description="Capture session",
  prompt="Start conversation session capture: $ARGUMENTS"
)
```
