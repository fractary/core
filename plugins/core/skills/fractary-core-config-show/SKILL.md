---
name: fractary-core-config-show
description: Display Fractary Core configuration (redacted)
---

# Config Show

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--json` | No | json |
| `--context` | No | context |

## Execution

Display the Fractary Core configuration using the CLI command `fractary-core config show`.

Sensitive values (tokens, keys, secrets) are automatically redacted.

Examples:
- Show config: `fractary-core config show`
