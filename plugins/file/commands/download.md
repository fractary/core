---
name: fractary-file:download
description: Download a file from storage - delegates to fractary-file:file-download agent
allowed-tools: Task(fractary-file:file-download)
model: claude-haiku-4-5
argument-hint: '<remote-path> [--source <name>] [--local-path <path>] [--context "<text>"]'
---

Use **Task** tool with `fractary-file:file-download` agent to download a file from storage.

```
Task(
  subagent_type="fractary-file:file-download",
  description="Download file from storage",
  prompt="Download file from storage: $ARGUMENTS"
)
```
