---
name: fractary-core:config-init
description: Initialize Fractary Core configuration for all plugins
allowed-tools: Task(fractary-core:config-creator)
model: claude-haiku-4-5
argument-hint: '[--plugins <list>] [--work-platform <name>] [--repo-platform <name>] [--file-handler <name>] [--yes] [--force] [--dry-run] [--context "<text>"]'
---

Use **Task** tool with `fractary-core:config-creator` agent to initialize Fractary Core configuration.

For fresh setup or force-overwrite of configuration. For incremental updates to existing config, use `/fractary-core:config-update` instead.

```
Task(
  subagent_type="fractary-core:config-creator",
  description="Initialize Fractary Core config",
  prompt="Initialize Fractary Core configuration: $ARGUMENTS"
)
```

Configuration is stored at: `.fractary/config.yaml` (YAML format)
