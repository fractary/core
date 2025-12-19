---
name: fractary-docs:audit
description: Audit documentation - delegates to fractary-docs:docs-audit agent
allowed-tools: Task(fractary-docs:docs-audit)
model: claude-haiku-4-5
argument-hint: '[directory] [--doc-type <type>]'
---

Delegates to fractary-docs:docs-audit agent for auditing documentation quality and finding issues.
