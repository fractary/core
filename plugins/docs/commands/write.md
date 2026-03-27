---
name: fractary-docs-write
description: Write documentation - delegates to fractary-docs-writer agent
allowed-tools: Agent(fractary-docs-writer)
model: claude-haiku-4-5
argument-hint: '<doc_type> [file_path] [--work-id <number>] [--skip-validation] [--batch] [--context "<text>"]'
---

Use **Agent** tool with `fractary-docs-writer` agent to create or update documentation.

```
Agent(
  subagent_type="fractary-docs-writer",
  description="Write documentation",
  prompt="Create or update documentation: $ARGUMENTS"
)
```
