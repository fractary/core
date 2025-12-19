---
name: fractary-repo:cleanup
description: Clean up stale branches - delegates to fractary-repo:cleanup agent
allowed-tools: Task(fractary-repo:cleanup)
model: claude-haiku-4-5
argument-hint: '[--delete] [--merged] [--inactive] [--days <n>] [--location <where>] [--exclude <pattern>]'
---

Delegates to fractary-repo:cleanup agent for cleaning up stale and merged branches.
