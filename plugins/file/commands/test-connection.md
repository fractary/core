---
name: fractary-file:test-connection
description: Test storage connection - delegates to fractary-file:file-test-connection agent
allowed-tools: Agent(fractary-file:file-test-connection)
model: claude-haiku-4-5
argument-hint: '[--handler <name>] [--verbose] [--quick] [--context "<text>"]'
---

Use **Agent** tool with `fractary-file:file-test-connection` agent to test storage connectivity.

```
Agent(
  subagent_type="fractary-file:file-test-connection",
  description="Test storage connection",
  prompt="Test storage connection: $ARGUMENTS"
)
```
