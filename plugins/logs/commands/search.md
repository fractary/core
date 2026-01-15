---
name: fractary-logs:search
description: Search logs - delegates to fractary-logs:logs-search agent
allowed-tools: Task(fractary-logs:logs-search)
model: claude-haiku-4-5
argument-hint: '"<query>" [--issue <number>] [--type <type>] [--since <date>] [--context "<text>"]'
---

Use **Task** tool with `fractary-logs:logs-search` agent to search across logs.

```
Task(
  subagent_type="fractary-logs:logs-search",
  description="Search logs",
  prompt="Search across logs: $ARGUMENTS"
)
```
