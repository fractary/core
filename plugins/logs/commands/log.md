---
name: fractary-logs:log
description: Log message - delegates to fractary-logs:logs-log agent
allowed-tools: Agent(fractary-logs:logs-log)
model: claude-haiku-4-5
argument-hint: '<issue_number> "<message>" [--context "<text>"]'
---

Use **Agent** tool with `fractary-logs:logs-log` agent to log messages to an issue's log.

```
Agent(
  subagent_type="fractary-logs:logs-log",
  description="Log message",
  prompt="Log message to issue: $ARGUMENTS"
)
```
