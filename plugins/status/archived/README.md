# Archived Status Plugin Components

This directory contains components that were replaced during the v3.0 MCP-First Architecture migration.

## Migration Date
2025-12-19

## What Changed

### Skills Replaced by Dedicated Agents

| Old Skill | New Agent | Reason |
|-----------|-----------|--------|
| `skills/status-line-manager/` | `agents/status-install.md` | v3.0 uses dedicated agents for orchestration |
| `skills/status-syncer/` | `agents/status-sync.md` | v3.0 uses dedicated agents for orchestration |

### Architecture Change

**Before (v2.0)**:
```
Command → Skill (orchestration)
```

**After (v3.0)**:
```
Command → Dedicated Agent → Scripts/MCP Tools
```

## Why These Components Were Archived

1. **Orchestration skills are anti-pattern in v3.0**: Skills should only provide expertise (standards, templates), not execute operations
2. **Dedicated agents provide isolation**: Each agent runs in isolated context, improving reliability
3. **Parameter-based tool restrictions**: Commands now use `allowed-tools: Task(agent-name)` for type safety

## Rollback Instructions

If you need to restore the old behavior:

1. Move `archived/skills/` back to `skills/`
2. Restore the original command files from git history
3. Remove the `agents/` directory

```bash
# Restore commands from git
git checkout HEAD~1 -- plugins/status/commands/install.md
git checkout HEAD~1 -- plugins/status/commands/sync.md

# Move skills back
mv plugins/status/archived/skills plugins/status/

# Remove agents
rm -rf plugins/status/agents
```

## Reference

- Migration spec: `specs/WORK-00218-plugin-v3-migration-plan.md`
- Framework guide: `docs/guides/new-claude-plugin-framework.md`
