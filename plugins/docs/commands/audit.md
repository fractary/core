---
name: fractary-docs:audit
description: Audit documentation - delegates to fractary-docs:docs-auditor agent
allowed-tools: Agent(fractary-docs:docs-auditor)
model: claude-haiku-4-5
argument-hint: '[directory] [--doc-type <type>] [--context "<text>"]'
---

Use **Agent** tool with `fractary-docs:docs-auditor` agent to audit documentation quality and find issues.

```
Agent(
  subagent_type="fractary-docs:docs-auditor",
  description="Audit documentation",
  prompt="Audit documentation quality and find issues: $ARGUMENTS"
)
```
