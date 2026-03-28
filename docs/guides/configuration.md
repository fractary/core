# Configuration Guide

Complete guide to configuring Fractary Core across all interfaces: SDK, CLI, MCP Server, and Plugins.

## Overview

Fractary Core uses a unified YAML configuration system. All toolsets are configured in a single file at `.fractary/config.yaml`.

### Key Features

- **Unified Configuration**: Single `.fractary/config.yaml` file for all toolsets
- **YAML Format**: Human-readable configuration
- **Environment Variables**: Support for `${VAR_NAME}` and `${VAR_NAME:-default}` syntax
- **Handler Pattern**: Easy switching between platforms via `active_handler`
- **Auto-Detection**: Detects repository settings automatically

### Configuration Methods

Fractary Core supports multiple configuration methods, resolved in this order (highest priority first):

1. **CLI flags** - Command-line arguments
2. **Environment variables** - `FRACTARY_*` and platform-specific
3. **Configuration file** - `.fractary/config.yaml`
4. **Programmatic configuration** - Direct code configuration (SDK only)
5. **Default values** - Built-in defaults

## Quick Start

Initialize configuration using the configure command:

```bash
# Interactive configuration
fractary-core-config-init

# Configure specific toolsets
fractary-core-config-init --plugins work,repo

# Specify platforms
fractary-core-config-init \
  --work-platform github \
  --repo-platform github \
  --file-handler local

# Preview changes without applying
fractary-core-config-init --dry-run

# Validate existing configuration
fractary-core-config-validate
```

## Configuration File

### Location

```
.fractary/config.yaml
```

> **Note**: Legacy projects may have config at `.fractary/core/config.yaml`. The SDK supports both locations, preferring the newer path.

### Basic Structure

```yaml
version: "2.0"

<toolset>:
  active_handler: <handler_name>
  handlers:
    <handler_name>:
      # Handler-specific settings
      token: ${ENV_VAR}
  defaults:
    # Toolset-specific defaults
```

### Complete Example

```yaml
version: "2.0"

work:
  active_handler: github
  handlers:
    github:
      owner: myorg
      repo: myrepo
      token: ${GITHUB_TOKEN}
      api_url: https://api.github.com

repo:
  active_handler: github
  handlers:
    github:
      token: ${GITHUB_TOKEN}
  defaults:
    default_branch: main

logs:
  schema_version: "2.0"
  storage:
    local_path: /logs
  session_logging:
    enabled: true
    redact_sensitive: true

file:
  active_handler: local
  handlers:
    local:
      base_path: .
      create_directories: true

docs:
  schema_version: "1.1"
  custom_templates_path: .fractary/docs/templates/manifest.yaml  # optional
```

**Note:** The 11 core document types (adr, api, architecture, audit, changelog, dataset, etl, guides, infrastructure, standards, testing) are always available from `templates/docs/`. The `custom_templates_path` is only needed if you want to add project-specific types or override core types.

## Configuration by Interface

### SDK Configuration

The SDK can be configured programmatically or by loading from the config file.

#### Programmatic Configuration

```typescript
import { WorkManager, RepoManager } from '@fractary/core';

const workManager = new WorkManager({
  provider: 'github',
  config: {
    owner: 'myorg',
    repo: 'myrepo',
    token: process.env.GITHUB_TOKEN
  }
});
```

#### Loading from Config File

```typescript
import { loadConfig } from '@fractary/core';

const config = await loadConfig('.fractary/config.yaml');
const workManager = new WorkManager(config.work);
```

See the [SDK documentation](../interfaces/sdk.md) for complete API reference.

### CLI Configuration

The CLI reads configuration from `.fractary/config.yaml` automatically.

```bash
# Uses default config
fractary-core work issue list

# Override with specific config file
fractary-core --config .fractary/staging.yaml work issue list

# Override with command-line flags
fractary-core work issue fetch 123 \
  --provider github \
  --owner myorg \
  --repo myrepo
```

See the [CLI documentation](../interfaces/cli.md) for complete command reference.

### MCP Server Configuration

The MCP Server reads configuration from `.fractary/config.yaml` or a custom path.

```bash
# Use default config
npx @fractary/core-mcp

# Use custom config
npx @fractary/core-mcp --config .fractary/config.yaml
```

#### Claude Code Integration

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

See the [MCP documentation](../interfaces/mcp.md) for complete reference.

### Plugin Configuration

Plugins read configuration from `.fractary/config.yaml`. Initialize with:

```bash
fractary-core-config-init
```

See the [plugin documentation](../interfaces/plugins.md) for plugin-specific details.

## Per-Toolset Configuration

Comprehensive configuration documentation for each toolset is in the feature docs:

| Toolset | Config Section | Reference |
|---------|---------------|-----------|
| **Work** | `work:` | [Work Tracking > Configuration](../features/work.md#configuration) |
| **Repo** | `repo:` | [Repository > Configuration](../features/repo.md#configuration) |
| **File** | `file:` | [File Storage > Configuration](../features/file.md#configuration) |
| **Logs** | `logs:` | [Log Management > Configuration](../features/logs.md#configuration) |
| **Docs** | `docs:` | [Documentation > Configuration](../features/docs.md#configuration) |

Each feature doc includes full field reference tables, handler setup, authentication details, and YAML examples.

## Environment Variables

### Variable Substitution

Use `${VAR_NAME}` syntax in configuration files:

```yaml
work:
  handlers:
    github:
      token: ${GITHUB_TOKEN}          # Required variable
      owner: ${GITHUB_OWNER:-myorg}   # With default value
```

### Common Variables

| Variable | Description | Used By |
|----------|-------------|---------|
| `GITHUB_TOKEN` | GitHub personal access token | Work, Repo |
| `JIRA_TOKEN` | Jira API token | Work |
| `LINEAR_API_KEY` | Linear API key | Work |
| `GITLAB_TOKEN` | GitLab personal access token | Repo |
| `BITBUCKET_USERNAME` | Bitbucket username | Repo |
| `BITBUCKET_APP_PASSWORD` | Bitbucket app password | Repo |
| `AWS_ACCESS_KEY_ID` | AWS access key | File (S3) |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | File (S3) |
| `AWS_REGION` | AWS region | File (S3) |
| `FRACTARY_CONFIG` | Config file path | All |
| `FRACTARY_LOG_LEVEL` | Log level | All |

## Multiple Environments

Use different config files for different environments:

```
.fractary/
├── config.yaml          # Default/local
├── staging.yaml         # Staging environment
├── production.yaml      # Production environment
└── config.example.yaml  # Template (committed to git)
```

Usage:
```bash
fractary-core --config .fractary/staging.yaml work issue list
```

## Validation

```bash
# Validate configuration
fractary-core-config-validate

# Show current configuration (secrets redacted)
fractary-core config show

# Test provider connections
fractary-core config test
```

## Incremental Updates

Update configuration using natural language:

```bash
fractary-core-config-update --context "switch to jira for work tracking"
fractary-core-config-update --context "enable S3 storage for file toolset"
```

## Best Practices

1. **Never commit secrets** - Use environment variables for tokens
2. **Commit example config** - Include `.fractary/config.example.yaml` with placeholders
3. **Use different configs per environment** - Separate staging and production
4. **Validate before deployment** - Run `fractary-core-config-validate`
5. **Document required variables** - List environment variables in your README

## Migration from v1.x

### What Changed

| Aspect | v1.x | v2.0 |
|--------|------|------|
| Config files | Multiple per-plugin | Single unified file |
| Format | JSON | YAML only |
| Location | `.fractary/plugins/<plugin>/config.json` | `.fractary/config.yaml` |
| Init command | Per-plugin (`fractary-work-init`) | Unified (`fractary-core-config-init`) |
| Platform switching | Reconfigure | `active_handler` setting |

### Migration Steps

1. **Backup existing configuration**
   ```bash
   tar czf fractary-backup-$(date +%Y%m%d).tar.gz .fractary/
   ```

2. **Update packages**
   ```bash
   npm install @fractary/core@2.0.0
   npm install -g @fractary/core-cli@2.0.0
   ```

3. **Initialize new configuration**
   ```bash
   fractary-core-config-init
   ```

4. **Validate and test**
   ```bash
   fractary-core-config-validate
   fractary-core work issue list
   ```

### Deprecated Commands

| Deprecated | Replacement |
|------------|-------------|
| `fractary-work-init` | `fractary-core-config-init --plugins work` |
| `fractary-repo-init` | `fractary-core-config-init --plugins repo` |
| `fractary-logs-init` | `fractary-core-config-init --plugins logs` |
| `fractary-file-init` | `fractary-core-config-init --plugins file` |
| `fractary-core-init` | `fractary-core-config-init` |

## Related Documentation

- [SDK Interface](../interfaces/sdk.md) - Programmatic configuration details
- [CLI Interface](../interfaces/cli.md) - CLI flag overrides
- [MCP Interface](../interfaces/mcp.md) - MCP server configuration
- [Plugin Interface](../interfaces/plugins.md) - Plugin-specific settings
- [Troubleshooting](./troubleshooting.md) - Common configuration issues
