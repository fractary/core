---
name: fractary-file-handler-switcher
description: Switch the active storage handler to a different configured provider (local, s3, r2, gcs, gdrive)
---

# File Handler Switcher

Switches the active storage handler. Use when the user wants to change storage providers.

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<handler>` | Yes | Target handler: local, s3, r2, gcs, gdrive |
| `--no-test` | No | Skip connection test after switching |
| `--force` | No | Switch even if handler appears unconfigured |

## Execution

Read `docs/switch-flow.md` and follow the switching workflow.
