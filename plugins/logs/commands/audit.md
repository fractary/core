---
name: fractary-logs:audit
description: Audit logs - delegates to fractary-logs:logs-audit agent
allowed-tools: Task(fractary-logs:logs-audit)
model: claude-haiku-4-5
argument-hint: '[--project-root <path>] [--execute] [--context "<text>"]'
---

Use **Task** tool with `fractary-logs:logs-audit` agent to audit logs and generate management plans.

```
Task(
  subagent_type="fractary-logs:logs-audit",
  description="Audit logs",
  prompt="Audit logs and generate management plan: $ARGUMENTS"
)
```
