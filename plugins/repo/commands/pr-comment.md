---
name: fractary-repo:pr-comment
description: Comment on pull requests - delegates to fractary-repo:pr-comment agent
allowed-tools: Task(fractary-repo:pr-comment)
model: claude-haiku-4-5
argument-hint: '<pr_number> ["<comment>"] [--prompt "<instructions>"]'
---

Delegates to fractary-repo:pr-comment agent for adding PR comments.
