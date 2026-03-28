# Getting Started

Get up and running with Fractary Core in under 5 minutes.

## Prerequisites

- **Node.js** >= 18.0.0
- **Git** repository (for repo operations)
- **GitHub token** (for work tracking and PR operations)

## 1. Choose Your Interface

| Use Case | Interface | Install |
|----------|-----------|---------|
| Building applications | [SDK](./interfaces/sdk.md) | `npm install -g @fractary/core` |
| Terminal and scripting | [CLI](./interfaces/cli.md) | `npm install -g @fractary/core-cli` |
| AI agent integration | [MCP Server](./interfaces/mcp.md) | `npm install -g @fractary/core-mcp` |
| Claude Code workflows | [Plugins](./interfaces/plugins.md) | See [plugin install guide](./interfaces/plugins.md#installation) |

You can use multiple interfaces - they all share the same configuration and underlying SDK.

## 2. Configure

All interfaces read from `.fractary/config.yaml`. Create one:

### Via CLI

```bash
fractary-core config configure --owner myorg --repo myrepo
```

### Via Claude Code Plugin

```
/fractary-core-config-init
```

### Manually

Create `.fractary/config.yaml`:

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
      owner: myorg
      repo: myrepo
      token: ${GITHUB_TOKEN}

logs:
  schema_version: "2.0"
  storage:
    file_handlers:
      - name: default
        write: logs-write
        archive: logs-archive

file:
  schema_version: "2.0"
  handlers:
    logs-write:
      type: local
      local:
        base_path: logs
    logs-archive:
      type: local
      local:
        base_path: logs/_archive
    docs-write:
      type: local
      local:
        base_path: docs
    docs-archive:
      type: local
      local:
        base_path: docs/_archive

docs:
  schema_version: "1.1"
  storage:
    file_handlers:
      - name: default
        write: docs-write
        archive: docs-archive
```

Set your GitHub token in the environment:

```bash
export GITHUB_TOKEN=ghp_your_token_here
```

## 3. Try It Out

### SDK

```typescript
import { createWorkManager } from '@fractary/core';

const workManager = await createWorkManager();
const issues = await workManager.searchIssues('', { state: 'open' });
console.log(`Found ${issues.length} open issues`);
```

### CLI

```bash
# List open issues
fractary-core work issue-search --state open

# Create an issue
fractary-core work issue-create --title "My first issue" --labels "enhancement"

# Check repo status
fractary-core repo status
```

### Claude Code Plugin

```
/fractary-work-issue-list
/fractary-work-issue-create
```

## Next Steps

- **[Feature Docs](./README.md#feature-areas)** - Deep dive into each toolset (Work, Repo, File, Logs, Docs)
- **[Configuration Guide](./guides/configuration.md)** - Environment variables, multi-env setup, validation
- **[Integration Guide](./guides/integration.md)** - CI/CD, Docker, framework integration patterns
