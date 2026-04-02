---
name: fractary-core-env-section-read
description: Read a plugin's managed section from an env file
---

# Env Section Read

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<plugin>` | Yes | plugin |
| `--env` | No | env |
| `--file` | No | file |

## Execution

Read a plugin's managed section from an env file using the CLI command `fractary-core config env-section-read`.

Displays the KEY=VALUE pairs owned by the specified plugin within the env file.

Examples:
- Read core section from default .env: `fractary-core config env-section-read fractary-core`
- Read from test env: `fractary-core config env-section-read fractary-core --env test`
- Read from explicit file: `fractary-core config env-section-read fractary-core --file .fractary/env/.env.prod`
