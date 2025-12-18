---
name: fractary-repo:tag-list
description: List tags with optional filtering
model: claude-haiku-4-5
argument-hint: '[--pattern <pattern>] [--latest <n>]'
---

List Git tags with optional pattern filtering.

Use the **Task** tool to invoke agent `fractary-repo:tag-list`:
```
Task(
  subagent_type="fractary-repo:tag-list",
  description="List Git tags",
  prompt="Parse arguments and list tags"
)
```

**Usage:**
```
/fractary-repo:tag-list
/fractary-repo:tag-list --pattern "v1.*"
/fractary-repo:tag-list --latest 5
```
