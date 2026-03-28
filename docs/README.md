# Fractary Core Documentation

Complete documentation for Fractary Core - foundational utilities for managing software development workflows.

See the [main README](../README.md) for project overview and design philosophy.

## Getting Started

New to Fractary Core? Start here: **[Getting Started Guide](./getting-started.md)**

## Feature Areas

Each feature area covers configuration, SDK methods, CLI commands, MCP tools, and Claude Code plugin commands in one place.

| Feature | Description | Doc |
|---------|-------------|-----|
| **Work Tracking** | Issues, comments, labels, milestones across GitHub/Jira/Linear | [features/work.md](./features/work.md) |
| **Repository Management** | Branches, commits, PRs, tags, worktrees across GitHub/GitLab/Bitbucket | [features/repo.md](./features/repo.md) |
| **File Storage** | Read, write, upload, download across Local/S3/R2/GCS/Google Drive | [features/file.md](./features/file.md) |
| **Log Management** | Session capture, CRUD, search, analysis, retention | [features/logs.md](./features/logs.md) |
| **Documentation** | Type-aware docs with creation, validation, refinement, archival | [features/docs.md](./features/docs.md) |

## Interfaces

General setup and usage guides for each way to access Fractary Core.

| Interface | Description | Doc |
|-----------|-------------|-----|
| **SDK** (TypeScript) | Manager classes, factory functions, error hierarchy | [interfaces/sdk.md](./interfaces/sdk.md) |
| **CLI** | Command-line with global options, JSON output, exit codes | [interfaces/cli.md](./interfaces/cli.md) |
| **MCP Server** | AI agent integration via Model Context Protocol | [interfaces/mcp.md](./interfaces/mcp.md) |
| **Claude Code Plugins** | Slash commands, agents, marketplace installation | [interfaces/plugins.md](./interfaces/plugins.md) |

## Guides

| Guide | Description |
|-------|-------------|
| [Configuration](./guides/configuration.md) | Unified `.fractary/config.yaml`, environment variables, multi-env |
| [Integration](./guides/integration.md) | CI/CD, Docker, framework integration patterns |
| [Troubleshooting](./guides/troubleshooting.md) | Common issues and solutions |
| [Plugin Development](./guides/new-claude-plugin-framework.md) | Creating new plugins (contributor-facing) |

## Standards

| Standard | Description |
|----------|-------------|
| [Config Management](./standards/config-management-standards.md) | Configuration management standards |

## Quick Cross-Reference

| Feature | SDK | CLI | MCP | Plugin |
|---------|-----|-----|-----|--------|
| Work | `WorkManager` | `fractary-core work` | `fractary_work_*` | `/fractary-work-*` |
| Repo | `RepoManager` | `fractary-core repo` | `fractary_repo_*` | `/fractary-repo-*` |
| File | `FileManager` | `fractary-core file` | `fractary_file_*` | `/fractary-file-*` |
| Logs | `LogManager` | `fractary-core logs` | `fractary_logs_*` | `/fractary-logs-*` |
| Docs | `DocsManager` | `fractary-core docs` | `fractary_docs_*` | `/fractary-docs-*` |
