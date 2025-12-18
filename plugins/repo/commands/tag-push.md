---
name: fractary-repo:tag-push
description: Push tag(s) to remote repository
model: claude-haiku-4-5
argument-hint: '<tag_name|all> [--remote <name>]'
---

Push Git tags to remote repository.

Use the **Task** tool to invoke agent `fractary-repo:tag-push`:
```
Task(
  subagent_type="fractary-repo:tag-push",
  description="Push Git tag",
  prompt="Parse arguments and push tag"
)
```

**Usage:**
```
/fractary-repo:tag-push v1.0.0
/fractary-repo:tag-push all
/fractary-repo:tag-push v2.0.0 --remote origin
```
