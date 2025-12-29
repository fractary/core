---
name: fractary-logs:read
description: Read logs - delegates to fractary-logs:logs-read agent
allowed-tools: Task(fractary-logs:logs-read)
model: claude-haiku-4-5
argument-hint: '<issue_number> [--type <type>] [--context "<text>"]'
---

Delegates to fractary-logs:logs-read agent for reading log files.
