---
name: fractary-logs:analyze
description: Analyze logs - delegates to fractary-logs:logs-analyze agent
allowed-tools: Task(fractary-logs:logs-analyze)
model: claude-haiku-4-5
argument-hint: '<type> [--issue <number>] [--since <date>] [--until <date>] [--verbose] [--context "<text>"]'
---

Use **Task** tool with `fractary-logs:logs-analyze` agent to analyze logs for patterns, errors, summaries, or time analysis.

```
Task(
  subagent_type="fractary-logs:logs-analyze",
  description="Analyze logs",
  prompt="Analyze logs: $ARGUMENTS"
)
```
