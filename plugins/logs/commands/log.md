---
name: fractary-logs:log
description: Log message - delegates to fractary-logs:logs-log agent
allowed-tools: Task(fractary-logs:logs-log)
model: claude-haiku-4-5
argument-hint: '<issue_number> "<message>" [--context "<text>"]'
---

Delegates to fractary-logs:logs-log agent for logging messages to an issue's log.
