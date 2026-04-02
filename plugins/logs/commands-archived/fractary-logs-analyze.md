---
name: fractary-logs-analyze
description: Analyze logs for patterns, errors, or time spent
allowed-tools: Skill(fractary-logs-analyzer), Bash, Read
model: claude-sonnet-4-6
argument-hint: '<analysis_type> [--log-type <type>] [--issue <number>] [--since <date>] [--until <date>] [--verbose]'
---

Use the **Skill** tool with `fractary-logs-analyzer` to analyze logs.

```
Skill(
  skill="fractary-logs-analyzer",
  args="$ARGUMENTS"
)
```
