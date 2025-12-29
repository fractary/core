---
name: fractary-docs:validate
description: Validate documentation - delegates to fractary-docs:docs-validate agent
allowed-tools: Task(fractary-docs:docs-validate)
model: claude-haiku-4-5
argument-hint: '[file_path|pattern] [doc_type] [--context "<text>"]'
---

Delegates to fractary-docs:docs-validate agent for validating documentation against type-specific rules.
