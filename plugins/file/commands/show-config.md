---
name: fractary-file-show-config
description: Show file plugin configuration - delegates to fractary-file-show-config agent
allowed-tools: Agent(fractary-file-show-config)
model: claude-haiku-4-5
argument-hint: '[--raw] [--path] [--verify] [--context "<text>"]'
---

Use **Agent** tool with `fractary-file-show-config` agent to display current file plugin configuration.

```
Agent(
  subagent_type="fractary-file-show-config",
  description="Show file plugin configuration",
  prompt="Show file plugin configuration: $ARGUMENTS"
)
```
