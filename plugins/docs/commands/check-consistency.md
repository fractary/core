---
name: fractary-docs:check-consistency
description: Check documentation consistency - delegates to fractary-docs:docs-check-consistency agent
allowed-tools: Task(fractary-docs:docs-check-consistency)
model: claude-haiku-4-5
argument-hint: '[--fix] [--targets <files>] [--base <ref>] [--context "<text>"]'
---

Delegates to fractary-docs:docs-check-consistency agent for checking if documentation is consistent with code changes.
