---
name: fractary-logs:init
description: Initialize logs plugin - delegates to fractary-logs:logs-init agent
allowed-tools: Task(fractary-logs:logs-init)
model: claude-haiku-4-5
argument-hint: '[--force] [--context "<text>"]'
---

Delegates to fractary-logs:logs-init agent for initializing plugin configuration and storage.
