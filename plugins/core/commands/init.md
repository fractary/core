---
name: fractary-core:init
description: Initialize Fractary Core configuration - unified init for all core plugins
allowed-tools: Task(fractary-core:config-manager)
model: claude-haiku-4-5
argument-hint: '[--plugins <list>] [--work-platform <name>] [--repo-platform <name>] [--file-handler <name>] [--yes] [--force] [--context "<text>"]'
---

Use **Task** tool with `fractary-core:config-manager` agent to initialize unified configuration for all core plugins.

```
Task(
  subagent_type="fractary-core:config-manager",
  description="Initialize Fractary Core configuration",
  prompt="Initialize Fractary Core configuration: $ARGUMENTS"
)
```

Configuration is created at: .fractary/core/config.yaml (YAML format)
