---
name: fractary-spec:spec-archive
description: Archive specifications - delegates to spec-archiver agent
allowed-tools: Task(fractary-spec:spec-archiver)
model: claude-haiku-4-5
argument-hint: '<issue_number> [--force] [--skip-warnings] [--context "<text>"]'
---

Use **Task** tool with `fractary-spec:spec-archiver` agent to archive completed specifications to cloud storage.

```
Task(
  subagent_type="fractary-spec:spec-archiver",
  description="Archive specifications",
  prompt="Archive specifications for issue: $ARGUMENTS"
)
```
