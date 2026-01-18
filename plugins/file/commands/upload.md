---
name: fractary-file:upload
description: Upload a file to storage - delegates to fractary-file:file-upload agent
allowed-tools: Task(fractary-file:file-upload)
model: claude-haiku-4-5
argument-hint: '<local-path> [--source <name>] [--remote-path <path>] [--context "<text>"]'
---

Use **Task** tool with `fractary-file:file-upload` agent to upload a file to storage.

```
Task(
  subagent_type="fractary-file:file-upload",
  description="Upload file to storage",
  prompt="Upload file to storage: $ARGUMENTS"
)
```
