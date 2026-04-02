---
name: fractary-core-config-init
description: Initialize Fractary Core configuration for all plugins
allowed-tools: Skill(fractary-core-config-initializer), Bash, Read, Edit, Write, Glob, AskUserQuestion
model: claude-haiku-4-5
argument-hint: '[--plugins <list>] [--work-platform <name>] [--repo-platform <name>] [--file-handler <name>] [--yes] [--force] [--dry-run]'
---

Use the **Skill** tool with `fractary-core-config-initializer` to initialize Fractary Core configuration.

For fresh setup or force-overwrite of configuration. For incremental updates to existing config, use `/fractary-core-config-update` instead.

```
Skill(
  skill="fractary-core-config-initializer",
  args="$ARGUMENTS"
)
```

Configuration is stored at: `.fractary/config.yaml` (YAML format)
