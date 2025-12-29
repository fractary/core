---
name: fractary-logs:cleanup
description: Cleanup logs - delegates to fractary-logs:logs-cleanup agent
allowed-tools: Task(fractary-logs:logs-cleanup)
model: claude-haiku-4-5
argument-hint: '[--older-than <days>] [--dry-run] [--context "<text>"]'
---

Delegates to fractary-logs:logs-cleanup agent for archiving and cleaning up old logs.
