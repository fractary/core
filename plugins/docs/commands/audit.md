---
name: fractary-docs:audit
description: Audit documentation - delegates to fractary-docs:docs-audit agent
allowed-tools: Task(fractary-docs:docs-audit)
model: claude-haiku-4-5
argument-hint: '[directory] [--doc-type <type>] [--context "<text>"]'
---

Use **Task** tool with `fractary-docs:docs-audit` agent to audit documentation quality and find issues.

```
Task(
  subagent_type="fractary-docs:docs-audit",
  description="Audit documentation",
  prompt="Audit documentation quality and find issues: $ARGUMENTS"
)
```
