---
name: fractary-logs-log
description: Log message to an issue's log
allowed-tools: Skill(fractary-logs-logger), Skill(fractary-logs-log-type-selector), Bash
model: claude-haiku-4-5
argument-hint: '<issue_number> "<message>" [--type <type>]'
---

Use the **Skill** tool with `fractary-logs-logger` to log messages to an issue's log.

```
Skill(
  skill="fractary-logs-logger",
  args="$ARGUMENTS"
)
```
