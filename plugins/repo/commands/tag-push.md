---
name: fractary-repo:tag-push
description: Push tag(s) to remote repository
model: claude-haiku-4-5
argument-hint: '<tag_name|all> [--remote <name>]'
---

Push Git tags to remote repository.

Invokes the **tag-push** agent to handle pushing tags.

**Usage:**
```
/fractary-repo:tag-push v1.0.0
/fractary-repo:tag-push all
/fractary-repo:tag-push v2.0.0 --remote origin
```
