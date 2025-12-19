---
name: fractary-repo:tag-create
description: Create Git tags - delegates to fractary-repo:tag-create agent
allowed-tools: Task(fractary-repo:tag-create)
model: claude-haiku-4-5
argument-hint: '<tag_name> [--message "<text>"] [--commit <sha>] [--sign] [--force]'
---

Delegates to fractary-repo:tag-create agent for creating Git tags.
