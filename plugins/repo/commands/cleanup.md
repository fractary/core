---
name: fractary-repo:cleanup
description: Clean up stale and merged branches safely
model: claude-haiku-4-5
argument-hint: '[--delete] [--merged] [--inactive] [--days <n>] [--location <where>] [--exclude <pattern>]'
---

Clean up stale and merged branches with safety checks.

Invokes the **cleanup** agent to identify and optionally delete old branches.

**Usage:**
```
/fractary-repo:cleanup
/fractary-repo:cleanup --merged --delete
/fractary-repo:cleanup --inactive --days 30 --location both
```
