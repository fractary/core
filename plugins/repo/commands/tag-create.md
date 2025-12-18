---
name: fractary-repo:tag-create
description: Create a new Git tag
model: claude-haiku-4-5
argument-hint: '<tag_name> [--message "<text>"] [--commit <sha>] [--sign] [--force]'
---

Create a Git tag for versioning and release management.

Invokes the **tag-create** agent to handle tag creation.

**Usage:**
```
/fractary-repo:tag-create v1.0.0
/fractary-repo:tag-create v2.0.0 --message "Release 2.0"
/fractary-repo:tag-create v1.0.1 --commit abc123
```
