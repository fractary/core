---
name: fractary-logs:archive
description: Archive logs - delegates to fractary-logs:logs-archive agent
allowed-tools: Task(fractary-logs:logs-archive)
model: claude-haiku-4-5
argument-hint: '<issue_number> [--force] [--retry] [--context "<text>"]'
---

Delegates to fractary-logs:logs-archive agent for archiving issue logs to cloud storage.
