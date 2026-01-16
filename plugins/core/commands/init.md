---
name: fractary-core:init
description: "[DEPRECATED] Use /fractary-core:config instead. This command will be removed in a future release."
allowed-tools: Task(fractary-core:config-manager)
model: claude-haiku-4-5
argument-hint: '[--plugins <list>] [--work-platform <name>] [--repo-platform <name>] [--file-handler <name>] [--yes] [--force] [--context "<text>"]'
---

# DEPRECATION NOTICE

This command is **DEPRECATED** and will be removed in a future release.

Please use `/fractary-core:config` instead, which provides the same functionality plus:
- Incremental configuration updates with `--context`
- Preview mode with `--dry-run`
- Validation mode with `--validate-only`
- Automatic backup and rollback

## Migration

Replace your usage:
- OLD: `/fractary-core:init`
- NEW: `/fractary-core:config`

All arguments are compatible.

---

Use **Task** tool with `fractary-core:config-manager` agent to configure Fractary Core.

**Show deprecation warning first**, then delegate to config-manager:

```
1. Display warning:
   "WARNING: /fractary-core:init is deprecated and will be removed in a future release.
    Please use /fractary-core:config instead."

2. Then delegate:
   Task(
     subagent_type="fractary-core:config-manager",
     description="Configure Fractary Core (via deprecated init)",
     prompt="Configure Fractary Core: $ARGUMENTS"
   )
```

Configuration is stored at: `.fractary/config.yaml` (YAML format)
