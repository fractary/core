---
name: fractary-file-upload
description: Upload a file to storage - delegates to fractary-file-upload agent
allowed-tools: Agent(fractary-file-upload)
model: claude-haiku-4-5
argument-hint: '<local-path> [--source <name>] [--remote-path <path>] [--context "<text>"]'
---

Use **Agent** tool with `fractary-file-upload` agent to upload a file to storage.

```
Agent(
  subagent_type="fractary-file-upload",
  description="Upload file to storage",
  prompt="Upload file to storage: $ARGUMENTS"
)
```
