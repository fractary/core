---
name: fractary-core:config
description: Configure Fractary Core - unified configuration for all plugins (init, update, validate)
allowed-tools: Task(fractary-core:config-manager)
model: claude-haiku-4-5
argument-hint: '[--plugins <list>] [--work-platform <name>] [--repo-platform <name>] [--file-handler <name>] [--yes] [--force] [--dry-run] [--validate-only] [--context "<text>"]'
---

Use **Task** tool with `fractary-core:config-manager` agent to configure Fractary Core for all plugins.

Supports:
- **Fresh setup**: Initialize configuration for new projects
- **Incremental updates**: Modify existing configuration with `--context`
- **Validation**: Check configuration with `--validate-only`
- **Preview**: See proposed changes without applying with `--dry-run`

```
Task(
  subagent_type="fractary-core:config-manager",
  description="Configure Fractary Core",
  prompt="Configure Fractary Core: $ARGUMENTS"
)
```

Configuration is stored at: `.fractary/config.yaml` (YAML format)
