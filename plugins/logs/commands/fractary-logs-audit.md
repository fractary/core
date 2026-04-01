---
name: fractary-logs-audit
description: Audit logs for compliance and health
allowed-tools: Skill(fractary-logs-manager), Bash, Read, Write, Glob
model: claude-sonnet-4-6
argument-hint: '[--project-root <path>] [--execute]'
---

Use the **Skill** tool with `fractary-logs-manager` in audit mode.

```
Skill(
  skill="fractary-logs-manager",
  args="audit $ARGUMENTS"
)
```
