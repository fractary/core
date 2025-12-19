---
name: fractary-work:comment-create
description: Add comment to issue - delegates to fractary-work:comment-create agent
allowed-tools: Task(fractary-work:comment-create)
model: claude-haiku-4-5
argument-hint: '<issue_number> ["<text>"] [--prompt "<instructions>"]'
---

Delegates to fractary-work:comment-create agent for adding comments to issues.
