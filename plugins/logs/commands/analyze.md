---
name: fractary-logs:analyze
description: Analyze logs - delegates to fractary-logs:logs-analyze agent
allowed-tools: Task(fractary-logs:logs-analyze)
model: claude-haiku-4-5
argument-hint: '<type> [--issue <number>] [--since <date>] [--until <date>] [--verbose]'
---

Delegates to fractary-logs:logs-analyze agent for analyzing logs for patterns, errors, summaries, or time analysis.
