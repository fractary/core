---
name: fractary-core-env-init
description: Initialize .fractary/env/ directory with template files. Use when initializing environment credential files.
---

# Env Init

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--context` | No | context |

## Execution

Initialize the `.fractary/env/` directory using the CLI command `fractary-core config env-init`.

This creates the `.fractary/env/` directory, a `.env.example` template, and updates `.fractary/.gitignore` to exclude env files.

Examples:
- Initialize: `fractary-core config env-init`
