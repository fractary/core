---
name: fractary-repo:cleanup
description: Clean up stale and merged branches safely
model: claude-haiku-4-5
argument-hint: '[--delete] [--merged] [--inactive] [--days <n>] [--location <where>] [--exclude <pattern>]'
---

Clean up stale and merged branches with safety checks.

Use the **Task** tool to invoke agent `fractary-repo:cleanup`:
```
Task(
  subagent_type="fractary-repo:cleanup",
  description="Cleanup branches",
  prompt="Parse arguments and cleanup old branches"
)
```

**Usage:**
```
/fractary-repo:cleanup
/fractary-repo:cleanup --merged --delete
/fractary-repo:cleanup --inactive --days 30 --location both
```
