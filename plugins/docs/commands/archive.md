---
name: fractary-docs:archive
description: Archive a document - delegates to fractary-docs:docs-archiver agent
allowed-tools: Agent(fractary-docs:docs-archiver)
model: claude-haiku-4-5
argument-hint: '<id> [--source <name>] [--context "<text>"]'
---

Use **Agent** tool with `fractary-docs:docs-archiver` agent to archive a document to its configured archive source.

```
Agent(
  subagent_type="fractary-docs:docs-archiver",
  description="Archive document",
  prompt="Archive document: $ARGUMENTS"
)
```
