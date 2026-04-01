---
name: fractary-core-config-initializer
description: Initialize Fractary Core configuration for a project — auto-detects platforms and project info, confirms with user via interactive prompts
---

# Config Initializer

Initialize `.fractary/config.yaml` for all core plugins (work, repo, logs, file, docs). For fresh setup or force-overwrite. For incremental updates, use fractary-core-config-updater instead.

Uses CLI `fractary-core config configure` as single source of truth for config generation — NEVER manually construct YAML.

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--plugins <list>` | No | Comma-separated plugins (default: all) |
| `--work-platform <name>` | No | github, jira, linear (auto-detected) |
| `--repo-platform <name>` | No | github, gitlab, bitbucket (auto-detected) |
| `--file-handler <name>` | No | local, s3 (default: local) |
| `--yes` | No | Skip confirmation prompts |
| `--force` | No | Overwrite existing configuration |
| `--dry-run` | No | Preview changes without applying |

## Execution

Read `docs/init-flow.md` and follow the initialization workflow.
