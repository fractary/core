---
name: fractary-spec:archive
description: Archive specifications - delegates to fractary-spec:spec-archive agent
allowed-tools: Task(fractary-spec:spec-archive)
model: claude-haiku-4-5
argument-hint: '<issue_number> [--force] [--skip-warnings] [--context "<text>"]'
---

Use **Task** tool with `fractary-spec:spec-archive` agent to archive completed specifications to cloud storage.

```
Task(
  subagent_type="fractary-spec:spec-archive",
  description="Archive specifications",
  prompt="Archive specifications for issue: $ARGUMENTS"
)
```
