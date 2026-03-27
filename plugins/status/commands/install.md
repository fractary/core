---
name: fractary-status:install
description: Install status line - delegates to fractary-status:status-install agent
allowed-tools: Agent(fractary-status:status-install)
model: claude-haiku-4-5
argument-hint: '[--context "<text>"]'
---

Use **Agent** tool with `fractary-status:status-install` agent to install the custom status line in the current project.

```
Agent(
  subagent_type="fractary-status:status-install",
  description="Install status line",
  prompt="Install custom status line: $ARGUMENTS"
)
```
