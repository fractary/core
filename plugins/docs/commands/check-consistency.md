---
name: fractary-docs:check-consistency
description: Check documentation consistency - delegates to fractary-docs:docs-consistency-checker agent
allowed-tools: Agent(fractary-docs:docs-consistency-checker)
model: claude-haiku-4-5
argument-hint: '[--fix] [--targets <files>] [--base <ref>] [--context "<text>"]'
---

Use **Agent** tool with `fractary-docs:docs-consistency-checker` agent to check if documentation is consistent with code changes.

```
Agent(
  subagent_type="fractary-docs:docs-consistency-checker",
  description="Check documentation consistency",
  prompt="Check if documentation is consistent with code changes: $ARGUMENTS"
)
```
