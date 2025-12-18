---
name: fractary-repo:tag-list
description: List tags with optional filtering
model: claude-haiku-4-5
argument-hint: '[--pattern <pattern>] [--latest <n>]'
---

List Git tags with optional pattern filtering.

Invokes the **tag-list** agent to display tags.

**Usage:**
```
/fractary-repo:tag-list
/fractary-repo:tag-list --pattern "v1.*"
/fractary-repo:tag-list --latest 5
```
