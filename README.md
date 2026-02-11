# Fractary Core

Core SDK for Fractary - Primitive operations for work tracking, repository management, specifications, logging, file storage, and documentation.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

Fractary Core provides foundational infrastructure for managing software development workflows. It implements primitive operations across 6 toolsets, accessible through 4 interfaces (SDK, CLI, MCP Server, Claude Code Plugins).

### Platform Support

> **Currently only GitHub is fully implemented** for work tracking and repository operations. Jira, Linear, GitLab, and Bitbucket provider stubs exist for future implementation.

| Toolset | Supported Platforms |
|---------|---------------------|
| **Work** | GitHub Issues (Jira, Linear planned) |
| **Repo** | GitHub (GitLab, Bitbucket planned) |
| **File** | Local, AWS S3, Cloudflare R2, Google Cloud Storage, Google Drive |
| **Spec, Logs, Docs** | Local storage |

## Interfaces

| Interface | Package | Install |
|-----------|---------|---------|
| **SDK** | [`@fractary/core`](./sdk/js/) | `npm install @fractary/core` |
| **CLI** | [`@fractary/core-cli`](./cli/) | `npm install -g @fractary/core-cli` |
| **MCP Server** | [`@fractary/core-mcp`](./mcp/server/) | `npx @fractary/core-mcp` |
| **Plugins** | 8 Claude Code plugins | See [plugin docs](./docs/plugins/README.md) |

## Quick Start

### SDK

```typescript
import { createWorkManager, createRepoManager } from '@fractary/core';

const workManager = await createWorkManager();
const issue = await workManager.fetchIssue(123);

const repoManager = await createRepoManager();
await repoManager.createBranch('feature/auth', { base: 'main', checkout: true });
```

### CLI

```bash
# Work tracking
fractary-core work issue-fetch 123
fractary-core work issue-create --title "Bug: Login fails" --labels "bug"

# Repository operations
fractary-core repo commit --message "Add feature" --type feat --all
fractary-core repo pr-create --title "Feature PR" --draft

# Specification management
fractary-core spec spec-create-file "API Design" --template feature --work-id 123
fractary-core spec spec-validate-check SPEC-20241216

# Log management
fractary-core logs write --type session --title "Debug session" --content "..." --issue 123
fractary-core logs search --query "error" --type session

# File operations
fractary-core file upload ./report.pdf --remote-path exports/report.pdf
fractary-core file list --prefix data/

# Documentation
fractary-core docs doc-create user-guide --title "User Guide" --content "..."
fractary-core docs doc-search --text "authentication"
```

### MCP Server

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

### Claude Code Plugins

```
/fractary-core:config-init          # Initialize configuration
/fractary-work:issue-fetch          # Fetch an issue
/fractary-repo:commit-push-pr       # Commit, push, and create PR
/fractary-spec:spec-create          # Create a specification
```

## Project Structure

```
core/
├── sdk/js/                # TypeScript SDK (@fractary/core)
├── cli/                   # CLI (@fractary/core-cli)
├── mcp/server/            # MCP Server (@fractary/core-mcp)
├── plugins/               # Claude Code plugins (8 total)
│   ├── core/              # Configuration management
│   ├── work/              # Work item tracking
│   ├── repo/              # Repository operations
│   ├── spec/              # Specification management
│   ├── logs/              # Log management
│   ├── file/              # File storage
│   ├── docs/              # Documentation management
│   └── status/            # Status line
├── docs/                  # Documentation
└── templates/             # Log and spec templates
```

## Documentation

**[Complete Documentation](./docs/README.md)**

| Documentation | Description |
|---------------|-------------|
| [SDK Reference](./docs/sdk/js/README.md) | TypeScript API - 6 Manager classes with full method signatures |
| [CLI Reference](./docs/cli/README.md) | 83 commands with all arguments and options |
| [MCP Reference](./docs/mcp/server/README.md) | 80 MCP tools across 6 modules |
| [Plugin Reference](./docs/plugins/README.md) | 81 slash commands, 32 agents across 8 plugins |
| [Configuration Guide](./docs/guides/configuration.md) | `.fractary/config.yaml` reference |
| [Integration Guide](./docs/guides/integration.md) | Integration patterns |
| [Troubleshooting](./docs/guides/troubleshooting.md) | Common issues and solutions |

## Development

```bash
# Install dependencies (all workspaces)
npm install

# Build all packages
npm run build

# Run tests
npm test

# Type checking
npm run typecheck
```

### Individual Packages

```bash
cd sdk/js && npm run build    # SDK
cd cli && npm run build       # CLI
cd mcp/server && npm run build # MCP Server
```

## License

MIT
