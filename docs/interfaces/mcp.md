# MCP Server

Model Context Protocol (MCP) server providing tools for AI agent integration across all Fractary Core toolsets.

**Package:** `@fractary/core-mcp`

## Installation

```bash
# Run directly with npx
npx @fractary/core-mcp

# Or install globally
npm install -g @fractary/core-mcp
```

## Quick Start

### Claude Code Integration

Add to `.claude/settings.json`:

```json
{
  "mcpServers": {
    "fractary-core": {
      "command": "npx",
      "args": ["-y", "@fractary/core-mcp"],
      "env": {
        "GITHUB_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

### With Custom Configuration

```json
{
  "mcpServers": {
    "fractary-core": {
      "command": "npx",
      "args": ["-y", "@fractary/core-mcp", "--config", ".fractary/config.yaml"],
      "env": {
        "GITHUB_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

## Tool Naming Convention

MCP tools follow a consistent naming pattern:

```
fractary_{toolset}_{resource}_{action}
```

| Example | Toolset | Resource | Action |
|---------|---------|----------|--------|
| `fractary_work_issue_create` | Work | Issue | Create |
| `fractary_repo_branch_create` | Repo | Branch | Create |
| `fractary_repo_pr_merge` | Repo | PR | Merge |
| `fractary_logs_capture` | Logs | - | Capture |
| `fractary_file_read` | File | - | Read |
| `fractary_docs_create` | Docs | - | Create |

## Configuration

The MCP server reads from `.fractary/config.yaml` (same as all other interfaces). See the [configuration guide](../guides/configuration.md) for setup.

### Environment Variables

```bash
export GITHUB_TOKEN=ghp_your_token
export FRACTARY_MCP_CONFIG=.fractary/config.yaml  # optional
export FRACTARY_MCP_LOG_LEVEL=info                 # optional
```

## Tool Response Format

### Success

```json
{
  "success": true,
  "data": { "number": 123, "title": "Issue title", "state": "open" }
}
```

### Error

```json
{
  "success": false,
  "error": { "code": "NOT_FOUND", "message": "Issue #999 not found" }
}
```

## Transport Options

### stdio (default)

```bash
npx @fractary/core-mcp
```

### HTTP/SSE

```bash
npx @fractary/core-mcp --transport http --port 3000
```

## Debugging

```bash
# Enable debug logging
FRACTARY_MCP_LOG_LEVEL=debug npx @fractary/core-mcp

# View tool execution logs (tools log to stderr)
npx @fractary/core-mcp 2>mcp-debug.log
```

## Feature References

For detailed tool documentation per toolset, see the feature docs:

- **[Work Tracking](../features/work.md)** - `fractary_work_*` tools
- **[Repository Management](../features/repo.md)** - `fractary_repo_*` tools
- **[File Storage](../features/file.md)** - `fractary_file_*` tools
- **[Log Management](../features/logs.md)** - `fractary_logs_*` tools
- **[Documentation](../features/docs.md)** - `fractary_docs_*` tools
