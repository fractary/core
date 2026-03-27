---
name: fractary-status-sync
description: Sync status cache - delegates to fractary-status-sync agent
allowed-tools: Agent(fractary-status-sync)
model: claude-haiku-4-5
argument-hint: '[--context "<text>"]'
---

Use **Agent** tool with `fractary-status-sync` agent to refresh the status cache and display current repository status.

```
Agent(
  subagent_type="fractary-status-sync",
  description="Sync status cache",
  prompt="Sync status cache and display repository status: $ARGUMENTS"
)
```
