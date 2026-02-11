# Fractary Core Documentation

Complete documentation for Fractary Core - foundational infrastructure for managing software development workflows.

## What is Fractary Core?

Fractary Core provides primitive operations for work tracking, repository management, specifications, logging, file storage, and documentation. It offers four interfaces (SDK, CLI, MCP Server, and Claude Code Plugins) to access these capabilities.

> **Platform note:** Currently, only **GitHub** is fully supported for work tracking and repository operations. Jira, Linear, GitLab, and Bitbucket providers exist as stubs for future implementation. File storage supports Local, S3, R2, GCS, and Google Drive.

## The 6 Toolsets

| Toolset | Description | Platform |
|---------|-------------|----------|
| **Work** | Work item and issue tracking | GitHub Issues (Jira, Linear planned) |
| **Repo** | Repository and Git operations | GitHub (GitLab, Bitbucket planned) |
| **Spec** | Technical specification management | Local storage |
| **Logs** | Session and operational logging | Local storage |
| **File** | File storage operations | Local, S3, R2, GCS, Google Drive |
| **Docs** | Documentation management | Local storage |

## The 4 Interfaces

### 1. SDK (TypeScript)

Programmatic access through Manager classes.

```typescript
import { createWorkManager, createRepoManager } from '@fractary/core';

const workManager = await createWorkManager();
const issue = await workManager.fetchIssue(123);
```

**[SDK Documentation](./sdk/js/README.md)** - 6 Manager classes, factory functions, full type definitions

### 2. CLI

Command-line access with 83 commands across 7 modules.

```bash
fractary-core work issue-fetch 123
fractary-core repo commit --message "Add feature" --type feat --all
fractary-core file upload ./report.pdf --remote-path exports/report.pdf
```

**[CLI Documentation](./cli/README.md)** - Complete command reference with all arguments and options

### 3. MCP Server

80 tools for AI agent integration via Model Context Protocol.

```json
{
  "mcpServers": {
    "fractary-core": {
      "command": "npx",
      "args": ["-y", "@fractary/core-mcp"]
    }
  }
}
```

**[MCP Documentation](./mcp/server/README.md)** - Setup and tool reference

### 4. Claude Code Plugins

81 slash commands and 32 agents across 8 plugins.

| Plugin | Commands | Agents | Description |
|--------|----------|--------|-------------|
| `fractary-core` | 7 | 3 | Configuration and environment management |
| `fractary-work` | 8 | 2 | Work item tracking |
| `fractary-repo` | 13 | 1 | Repository operations |
| `fractary-spec` | 9 | 9 | Specification management |
| `fractary-logs` | 15 | 4 | Log management |
| `fractary-file` | 13 | 5 | File storage |
| `fractary-docs` | 14 | 6 | Documentation management |
| `fractary-status` | 2 | 2 | Status line |

**[Plugins Documentation](./plugins/README.md)** - All commands, agents, and triggers

## Quick Navigation

### By Toolset

| Toolset | SDK | CLI | MCP | Plugin |
|---------|-----|-----|-----|--------|
| Work | [API](./sdk/js/README.md#workmanager) | [Commands](./cli/README.md#work-commands) | [Tools](./mcp/server/README.md) | [Plugin](./plugins/README.md#fractary-work) |
| Repo | [API](./sdk/js/README.md#repomanager) | [Commands](./cli/README.md#repo-commands) | [Tools](./mcp/server/README.md) | [Plugin](./plugins/README.md#fractary-repo) |
| Spec | [API](./sdk/js/README.md#specmanager) | [Commands](./cli/README.md#spec-commands) | [Tools](./mcp/server/README.md) | [Plugin](./plugins/README.md#fractary-spec) |
| Logs | [API](./sdk/js/README.md#logmanager) | [Commands](./cli/README.md#logs-commands) | [Tools](./mcp/server/README.md) | [Plugin](./plugins/README.md#fractary-logs) |
| File | [API](./sdk/js/README.md#filemanager) | [Commands](./cli/README.md#file-commands) | [Tools](./mcp/server/README.md) | [Plugin](./plugins/README.md#fractary-file) |
| Docs | [API](./sdk/js/README.md#docsmanager) | [Commands](./cli/README.md#docs-commands) | [Tools](./mcp/server/README.md) | [Plugin](./plugins/README.md#fractary-docs) |

### Guides

- **[Configuration Guide](./guides/configuration.md)** - Unified `.fractary/config.yaml` reference
- **[Integration Guide](./guides/integration.md)** - Integration patterns and best practices
- **[Troubleshooting](./guides/troubleshooting.md)** - Common issues and solutions

### For Contributors

- **[Development Standards](./standards/config-management-standards.md)** - Configuration management standards
- **[Plugin Development](./guides/new-claude-plugin-framework.md)** - Creating new plugins

## Getting Started

### 1. Choose Your Interface

| Use Case | Recommended Interface |
|----------|----------------------|
| Building applications | SDK |
| Scripting and automation | CLI |
| AI agent integration | MCP Server |
| Claude Code workflows | Plugins |

### 2. Install

```bash
# SDK
npm install @fractary/core

# CLI
npm install -g @fractary/core-cli

# MCP Server (no install needed)
npx @fractary/core-mcp

# Plugins - installed via Claude Code settings
```

### 3. Configure

Create `.fractary/config.yaml` (or use the CLI/plugin initializer):

```bash
# Via CLI
fractary-core config configure --owner myorg --repo myrepo

# Via Claude Code plugin
/fractary-core:config-init
```

Minimal config:

```yaml
version: "2.0"

work:
  active_handler: github
  handlers:
    github:
      owner: myorg
      repo: myrepo
      token: ${GITHUB_TOKEN}

repo:
  active_handler: github
  handlers:
    github:
      token: ${GITHUB_TOKEN}
```

See the [Configuration Guide](./guides/configuration.md) for complete options.

## Terminology

| Term | Context | Example |
|------|---------|---------|
| **Toolset** | Conceptual grouping | "The Work toolset handles issue tracking" |
| **Module** | SDK | `import { WorkManager } from '@fractary/core/work'` |
| **Command group** | CLI | `fractary-core work issue-create` |
| **Tool** | MCP Server | `fractary_work_issue_create` |
| **Plugin** | Claude Code | `fractary-work` plugin |
| **Command** | Plugin | `/fractary-work:issue-create` slash command |
| **Agent** | Plugin | `issue-refine-agent` autonomous handler |
