---
name: fractary-repo:branch-list
description: List branches with optional filtering
model: claude-haiku-4-5
argument-hint: '[--stale] [--merged] [--days <n>] [--pattern <pattern>]'
---

List Git branches with optional filtering by pattern, merge status, or staleness.

Invokes the **branch-list** agent to display branches.

**Usage:**
```
/fractary-repo:branch-list
/fractary-repo:branch-list --merged
/fractary-repo:branch-list --pattern "feature/*"
```
