---
name: fractary-logs:search
description: Search logs - delegates to fractary-logs:logs-search agent
allowed-tools: Task(fractary-logs:logs-search)
model: claude-haiku-4-5
argument-hint: '"<query>" [--issue <number>] [--type <type>] [--since <date>]'
---

Delegates to fractary-logs:logs-search agent for searching across logs.
