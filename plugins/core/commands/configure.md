---
name: fractary-core:configure
description: Configure Fractary Core - initialize or set up configuration for all plugins
allowed-tools: Task(fractary-core:configure-agent)
model: claude-haiku-4-5
argument-hint: '[--plugins <list>] [--work-platform <name>] [--repo-platform <name>] [--file-handler <name>] [--yes] [--force] [--dry-run] [--context "<text>"]'
---

Use **Task** tool with `fractary-core:configure-agent` agent to initialize or set up Fractary Core configuration.

For fresh setup or force-overwrite of configuration. For incremental updates to existing config, use `/fractary-core:config-update` instead.

```
Task(
  subagent_type="fractary-core:configure-agent",
  description="Configure Fractary Core",
  prompt="Configure Fractary Core: $ARGUMENTS"
)
```

Configuration is stored at: `.fractary/config.yaml` (YAML format)
