---
name: fractary-docs:write
description: Write documentation - delegates to fractary-docs:docs-write agent
allowed-tools: Task(fractary-docs:docs-write)
model: claude-haiku-4-5
argument-hint: '<doc_type> [file_path] [--skip-validation] [--batch] [--context "<text>"]'
---

Delegates to fractary-docs:docs-write agent for creating or updating documentation.
