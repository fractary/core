---
name: fractary-docs-validate
description: Validate documentation - delegates to fractary-docs-validator agent
allowed-tools: Agent(fractary-docs-validator)
model: claude-haiku-4-5
argument-hint: '[file_path|pattern] [doc_type] [--context "<text>"]'
---

Use **Agent** tool with `fractary-docs-validator` agent to validate documentation against type-specific rules.

```
Agent(
  subagent_type="fractary-docs-validator",
  description="Validate documentation",
  prompt="Validate documentation against type-specific rules: $ARGUMENTS"
)
```
