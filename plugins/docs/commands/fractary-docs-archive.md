---
name: fractary-docs-archive
description: Archive a document
allowed-tools: Skill(fractary-docs-archiver), Bash, Read
model: claude-haiku-4-5
argument-hint: '<id> [--source <name>]'
---

Use the **Skill** tool with `fractary-docs-archiver` to archive a document.

```
Skill(
  skill="fractary-docs-archiver",
  args="$ARGUMENTS"
)
```
