---
name: list
description: List files in storage
arguments:
  - name: prefix
    description: Path prefix to filter files
    required: false
  - name: source
    description: Named source from config (e.g., specs, logs)
    required: false
  - name: context
    description: Additional instructions for the agent
    required: false
invocation: file list [prefix] [--source <name>] [--context "<text>"]
---

List files in configured storage.

## Examples

```bash
# List all files in default storage
file list

# List files with prefix
file list docs/

# List files from specific source
file list --source specs

# List files with prefix from source
file list archive/ --source specs
```
