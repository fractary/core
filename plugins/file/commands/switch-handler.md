---
name: fractary-file:switch-handler
description: Switch storage handler - delegates to fractary-file:file-switch-handler agent
allowed-tools: Task(fractary-file:file-switch-handler)
model: claude-haiku-4-5
argument-hint: '<handler> [--no-test] [--force] [--context "<text>"]'
---

Use **Task** tool with `fractary-file:file-switch-handler` agent to switch the active storage handler.

```
Task(
  subagent_type="fractary-file:file-switch-handler",
  description="Switch storage handler",
  prompt="Switch storage handler: $ARGUMENTS"
)
```
