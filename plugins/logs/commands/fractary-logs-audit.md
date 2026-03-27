---
name: fractary-logs-audit
description: Audit logs - delegates to fractary-logs-audit agent
allowed-tools: Agent(fractary-logs-audit)
model: claude-haiku-4-5
argument-hint: '[--project-root <path>] [--execute] [--context "<text>"]'
---

Use **Agent** tool with `fractary-logs-audit` agent to audit logs and generate management plans.

```
Agent(
  subagent_type="fractary-logs-audit",
  description="Audit logs",
  prompt="Audit logs and generate management plan: $ARGUMENTS"
)
```
