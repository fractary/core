---
name: fractary-file:test-connection
description: Test storage connection - delegates to fractary-file:file-test-connection agent
allowed-tools: Task(fractary-file:file-test-connection)
model: claude-haiku-4-5
argument-hint: '[--handler <name>] [--verbose] [--quick] [--context "<text>"]'
---

Use **Task** tool with `fractary-file:file-test-connection` agent to test storage connectivity.

```
Task(
  subagent_type="fractary-file:file-test-connection",
  description="Test storage connection",
  prompt="Test storage connection: $ARGUMENTS"
)
```
