---
name: fractary-work:comment-list
description: List comments on issue - delegates to fractary-work:comment-list agent
allowed-tools: Task(fractary-work:comment-list)
model: claude-haiku-4-5
argument-hint: '<issue_number> [--limit <n>] [--since <date>]'
---

Delegates to fractary-work:comment-list agent for listing comments on issues.
