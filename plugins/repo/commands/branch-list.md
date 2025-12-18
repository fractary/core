---
name: fractary-repo:branch-list
description: List branches with optional filtering
model: claude-haiku-4-5
argument-hint: '[--stale] [--merged] [--days <n>] [--pattern <pattern>]'
---

List Git branches with optional filtering by pattern, merge status, or staleness.

Use the **Task** tool to invoke agent `fractary-repo:branch-list`:
```
Task(
  subagent_type="fractary-repo:branch-list",
  description="List branches",
  prompt="Parse arguments and list branches with specified filters"
)
```

**Usage:**
```
/fractary-repo:branch-list
/fractary-repo:branch-list --merged
/fractary-repo:branch-list --pattern "feature/*"
```
