---
name: fractary-logs:analyze
description: Analyze logs - delegates to fractary-logs:logs-analyze agent
allowed-tools: Agent(fractary-logs:logs-analyze)
model: claude-haiku-4-5
argument-hint: '<type> [--issue <number>] [--since <date>] [--until <date>] [--verbose] [--context "<text>"]'
---

Use **Agent** tool with `fractary-logs:logs-analyze` agent to analyze logs for patterns, errors, summaries, or time analysis.

```
Agent(
  subagent_type="fractary-logs:logs-analyze",
  description="Analyze logs",
  prompt="Analyze logs: $ARGUMENTS"
)
```
