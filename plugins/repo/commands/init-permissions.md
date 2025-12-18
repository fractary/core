---
name: fractary-repo:init-permissions
description: Configure Claude Code permissions for repo plugin operations
model: claude-haiku-4-5
argument-hint: ''
---

Configure Claude Code permissions in `.claude/settings.json` for safe repository operations.

Use the **Task** tool to invoke agent `fractary-repo:init-permissions`:
```
Task(
  subagent_type="fractary-repo:init-permissions",
  description="Configure permissions",
  prompt="Setup required permissions"
)
```

**Usage:**
```
/fractary-repo:init-permissions
```
