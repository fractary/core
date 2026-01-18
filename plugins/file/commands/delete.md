---
name: delete
description: Delete a file from storage
arguments:
  - name: path
    description: Remote path to delete
    required: true
  - name: source
    description: Named source from config (e.g., specs, logs)
    required: false
  - name: context
    description: Additional instructions for the agent
    required: false
invocation: file delete <path> [--source <name>] [--context "<text>"]
---

Delete a file from configured storage.

## Examples

```bash
# Delete from default storage
file delete docs/old-file.txt

# Delete from specific source
file delete archive/SPEC-001.md --source specs
```
