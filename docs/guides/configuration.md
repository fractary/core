# Configuration Guide

Complete guide to configuring Fractary Core SDK, CLI, MCP server, and plugins using the unified YAML configuration (v2.0).

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Configuration Structure](#configuration-structure)
- [Initialization](#initialization)
- [Plugin Configuration](#plugin-configuration)
- [Environment Variables](#environment-variables)
- [Platform-Specific Configuration](#platform-specific-configuration)
- [CLI Configuration](#cli-configuration)
- [SDK Configuration](#sdk-configuration)
- [MCP Server Configuration](#mcp-server-configuration)
- [Migration Guide](#migration-guide)

## Overview

**v2.0 introduces a unified YAML configuration system** that consolidates all plugin configs into a single `.fractary/core/config.yaml` file. This is a **breaking change** requiring projects to re-initialize.

### What's New in v2.0

- ✅ **Unified Configuration**: Single `.fractary/core/config.yaml` file for all plugins
- ✅ **YAML Format**: Human-readable YAML (JSON no longer supported)
- ✅ **Environment Variables**: Support for `${VAR_NAME}` and `${VAR_NAME:-default}` syntax
- ✅ **Multi-Platform Support**: Configure multiple platforms per plugin
- ✅ **Handler Pattern**: Switch between platforms via `active_handler` setting
- ⚠️ **Breaking Change**: No backward compatibility with v1.x configs

### Configuration Methods

Fractary Core supports multiple configuration methods:

1. **Unified Config File** - `.fractary/core/config.yaml` (primary method)
2. **Environment Variables** - For credentials and runtime settings
3. **Programmatic Configuration** - Direct configuration in code
4. **CLI Flags** - Command-line overrides

Configuration is resolved in this order (highest priority first):
1. CLI flags
2. Environment variables
3. Project configuration file (`.fractary/core/config.yaml`)
4. Default values

## Quick Start

Initialize your project with the unified configuration:

```bash
# Initialize all plugins
fractary-core:init

# Initialize specific plugins only
fractary-core:init --plugins work,repo

# Force overwrite existing config
fractary-core:init --force

# Specify platforms
fractary-core:init \
  --work-platform github \
  --repo-platform github \
  --file-handler local
```

This creates `.fractary/core/config.yaml` with all necessary sections.

## Configuration Structure

### File Location

**v2.0 Configuration Path**: `.fractary/core/config.yaml`

⚠️ **Important**: The config is located at `.fractary/core/config.yaml` (inside the `core/` directory), NOT `.fractary/core.yaml`.

### Basic Structure

The unified configuration follows this structure:

```yaml
version: "2.0"

# Each plugin section follows the handler pattern
<plugin_name>:
  active_handler: <handler_name>  # Which platform to use
  handlers:
    <handler_name>:
      # Handler-specific configuration
      token: ${ENV_VAR}  # Environment variable reference
  defaults:
    # Plugin-specific defaults
  # Additional plugin settings
```

### Complete Example

See `.fractary/core/config.example.yaml` for a comprehensive example with all plugins configured.

Basic example:

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
      api_url: https://api.github.com
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
  schema_version: "1.0"
  active_handler: local
  handlers:
    local:
      base_path: .
      create_directories: true

spec:
  schema_version: "1.0"
  storage:
    local_path: /specs

docs:
  schema_version: "1.1"
  doc_types:
    adr:
      enabled: true
      path: docs/architecture/ADR
```

## Initialization

### Using the Init Command

The recommended way to create your configuration is using the init command:

```bash
# Initialize with auto-detection
fractary-core:init

# Initialize specific plugins
fractary-core:init --plugins work,repo,logs

# Specify platforms
fractary-core:init --work-platform github --repo-platform github

# Skip prompts
fractary-core:init --yes

# Force overwrite
fractary-core:init --force
```

### Manual Configuration

You can also manually create `.fractary/core/config.yaml`:

```yaml
# Work tracking configuration
work:
  provider: github
  config:
    owner: myorg
    repo: myrepo
    token: ${GITHUB_TOKEN}  # Environment variable reference

# Repository configuration
repo:
  provider: github
  config:
    owner: myorg
    repo: myrepo
    token: ${GITHUB_TOKEN}
    defaultBranch: main

# Specification management
spec:
  directory: ./specs
  template: feature
  autoValidate: true

# Log management
logs:
  directory: ./logs
  level: info
  redactSensitive: true
  maxAgeDays: 90

# File storage
file:
  baseDirectory: ./data
  allowedPatterns:
    - "*.json"
    - "*.yaml"
    - "*.txt"

# Documentation
docs:
  directory: ./docs
  format: markdown
  defaultTags:
    - project
```

### JSON Configuration

Alternatively, use `.fractary/core.json`:

```json
{
  "work": {
    "provider": "github",
    "config": {
      "owner": "myorg",
      "repo": "myrepo",
      "token": "${GITHUB_TOKEN}"
    }
  },
  "repo": {
    "provider": "github",
    "config": {
      "owner": "myorg",
      "repo": "myrepo",
      "token": "${GITHUB_TOKEN}"
    }
  },
  "spec": {
    "directory": "./specs",
    "template": "feature"
  },
  "logs": {
    "directory": "./logs",
    "level": "info"
  }
}
```

## SDK Configuration

### Programmatic Configuration

```typescript
import { WorkManager, RepoManager, SpecManager, LogsManager } from '@fractary/core';

// Work tracking
const workManager = new WorkManager({
  provider: 'github',
  config: {
    owner: 'myorg',
    repo: 'myrepo',
    token: process.env.GITHUB_TOKEN
  }
});

// Repository management
const repoManager = new RepoManager({
  provider: 'github',
  config: {
    owner: 'myorg',
    repo: 'myrepo',
    token: process.env.GITHUB_TOKEN
  }
});

// Specifications
const specManager = new SpecManager({
  specDirectory: './specs',
  defaultTemplate: 'feature'
});

// Logs
const logsManager = new LogsManager({
  logsDirectory: './logs',
  redactSensitive: true
});
```

### Configuration from File

```typescript
import { loadConfig } from '@fractary/core';

const config = await loadConfig('.fractary/core/config.yaml');

const workManager = new WorkManager(config.work);
const repoManager = new RepoManager(config.repo);
```

## CLI Configuration

### Global Configuration

The CLI reads from `.fractary/core/config.yaml` or environment variables.

### Initialize Configuration

```bash
# Initialize work tracking (deprecated - use fractary-core:init)
fractary-core work init --provider github

# Recommended: Use unified init
fractary-core:init
```

### Override with Flags

```bash
# Override config file settings
fractary-core work issue fetch 123 \
  --provider github \
  --owner myorg \
  --repo myrepo \
  --token $GITHUB_TOKEN
```

### Specify Config File

```bash
# Use a specific config file
fractary-core --config .fractary/staging.yaml work issue list
```

## MCP Server Configuration

### Server Configuration File

Create `.fractary/core-mcp.yaml`:

```yaml
# Server settings
server:
  name: fractary-core
  version: 0.1.0

# Module configurations
work:
  provider: github
  config:
    owner: myorg
    repo: myrepo
    token: ${GITHUB_TOKEN}

repo:
  provider: github
  config:
    owner: myorg
    repo: myrepo
    token: ${GITHUB_TOKEN}

spec:
  directory: ./specs

logs:
  directory: ./logs
  level: info

file:
  baseDirectory: ./data

docs:
  directory: ./docs
```

### Claude Code Integration

Add to `.claude/settings.json`:

```json
{
  "mcpServers": {
    "fractary-core": {
      "command": "npx",
      "args": [
        "-y",
        "@fractary/core-mcp",
        "--config",
        ".fractary/core-mcp.yaml"
      ],
      "env": {
        "GITHUB_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

## Plugin Configuration

### Claude Code Plugin Configuration

Each plugin can have its own configuration in `.fractary/plugins/`:

#### Work Plugin

`.fractary/plugins/work.yaml`:

```yaml
provider: github
repository:
  owner: myorg
  name: myrepo
token: ${GITHUB_TOKEN}

defaultLabels:
  - fractary
defaultIssueTemplate: feature
```

#### Repo Plugin

`.fractary/plugins/repo.yaml`:

```yaml
provider: github
repository:
  owner: myorg
  name: myrepo
token: ${GITHUB_TOKEN}

branchNaming:
  format: "{type}/{work-id}-{description}"
  maxLength: 50

commitConvention: conventional
defaultBase: main
```

#### Spec Plugin

`.fractary/plugins/spec.yaml`:

```yaml
directory: ./specs
template: feature
autoValidate: true
refinementQuestions: true
```

## Environment Variables

### Global Variables

```bash
# Work tracking
export FRACTARY_WORK_PROVIDER=github
export GITHUB_TOKEN=ghp_your_token_here
export JIRA_TOKEN=your_jira_token
export LINEAR_API_KEY=your_linear_key

# Repository
export FRACTARY_REPO_PROVIDER=github
export GITLAB_TOKEN=your_gitlab_token
export BITBUCKET_TOKEN=your_bitbucket_token

# Directories
export FRACTARY_SPEC_DIRECTORY=./specs
export FRACTARY_LOGS_DIRECTORY=./logs
export FRACTARY_FILE_BASE_DIRECTORY=./data
export FRACTARY_DOCS_DIRECTORY=./docs

# Logging
export FRACTARY_LOG_LEVEL=info
export FRACTARY_REDACT_SENSITIVE=true
```

### Module-Specific Variables

```bash
# Work module
export FRACTARY_WORK_DEFAULT_LABELS=bug,priority:high
export FRACTARY_WORK_AUTO_ASSIGN=true

# Repo module
export FRACTARY_REPO_DEFAULT_BRANCH=main
export FRACTARY_REPO_AUTO_PUSH=false

# Spec module
export FRACTARY_SPEC_AUTO_VALIDATE=true
export FRACTARY_SPEC_TEMPLATE=feature

# Logs module
export FRACTARY_LOGS_MAX_AGE_DAYS=90
export FRACTARY_LOGS_AUTO_ARCHIVE=true
```

## Platform-Specific Configuration

### GitHub

```yaml
work:
  provider: github
  config:
    owner: myorg
    repo: myrepo
    token: ${GITHUB_TOKEN}
    baseUrl: https://api.github.com  # For GitHub Enterprise

repo:
  provider: github
  config:
    owner: myorg
    repo: myrepo
    token: ${GITHUB_TOKEN}
```

**Environment Variables:**
```bash
export GITHUB_TOKEN=ghp_your_token_here
export GITHUB_OWNER=myorg
export GITHUB_REPO=myrepo
```

### Jira

```yaml
work:
  provider: jira
  config:
    host: https://myorg.atlassian.net
    email: user@example.com
    token: ${JIRA_TOKEN}
    project: PROJ
```

**Environment Variables:**
```bash
export JIRA_HOST=https://myorg.atlassian.net
export JIRA_EMAIL=user@example.com
export JIRA_TOKEN=your_jira_api_token
export JIRA_PROJECT=PROJ
```

### Linear

```yaml
work:
  provider: linear
  config:
    apiKey: ${LINEAR_API_KEY}
    teamId: team-id
```

**Environment Variables:**
```bash
export LINEAR_API_KEY=lin_api_your_key_here
export LINEAR_TEAM_ID=team-id
```

### GitLab

```yaml
repo:
  provider: gitlab
  config:
    projectId: 12345
    token: ${GITLAB_TOKEN}
    baseUrl: https://gitlab.com/api/v4  # For self-hosted GitLab
```

**Environment Variables:**
```bash
export GITLAB_TOKEN=glpat_your_token_here
export GITLAB_PROJECT_ID=12345
```

### Bitbucket

```yaml
repo:
  provider: bitbucket
  config:
    workspace: myworkspace
    repo: myrepo
    username: ${BITBUCKET_USERNAME}
    appPassword: ${BITBUCKET_APP_PASSWORD}
```

**Environment Variables:**
```bash
export BITBUCKET_USERNAME=your_username
export BITBUCKET_APP_PASSWORD=your_app_password
export BITBUCKET_WORKSPACE=myworkspace
```

## Advanced Configuration

### Multi-Environment Setup

Use different config files for different environments:

```bash
.fractary/
└── core/
    ├── config.yaml           # Default/local (unified config)
    ├── staging.yaml          # Staging environment
    ├── production.yaml       # Production environment
    └── config.example.yaml   # Example template
```

**Usage:**
```bash
# Use staging config
fractary-core --config .fractary/staging.yaml work issue list

# Use production config
fractary-core --config .fractary/production.yaml work issue create "Title"
```

### Configuration Validation

```bash
# Validate configuration
fractary-core config validate

# Show current configuration
fractary-core config show

# Test connection to providers
fractary-core config test
```

### Secrets Management

**Using environment files:**

Create `.env`:
```bash
GITHUB_TOKEN=ghp_your_token_here
JIRA_TOKEN=your_jira_token
LINEAR_API_KEY=your_linear_key
```

Load in your application:
```typescript
import dotenv from 'dotenv';
dotenv.config();

const workManager = new WorkManager({
  provider: 'github',
  config: {
    token: process.env.GITHUB_TOKEN
  }
});
```

**Using secret managers:**

```typescript
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

async function getSecret(name: string): Promise<string> {
  const client = new SecretManagerServiceClient();
  const [version] = await client.accessSecretVersion({ name });
  return version.payload.data.toString();
}

const githubToken = await getSecret('projects/my-project/secrets/github-token/versions/latest');

const workManager = new WorkManager({
  provider: 'github',
  config: {
    token: githubToken
  }
});
```

## Configuration Precedence

Configuration is merged in this order (later overrides earlier):

1. **Default values** - Built-in defaults
2. **Configuration file** - `.fractary/core/config.yaml`
3. **Environment variables** - `FRACTARY_*` and platform-specific variables
4. **CLI flags** - Command-line arguments
5. **Programmatic overrides** - Direct code configuration

## Configuration Schema

Full configuration schema:

```typescript
interface CoreConfig {
  work?: WorkConfig;
  repo?: RepoConfig;
  spec?: SpecConfig;
  logs?: LogsConfig;
  file?: FileConfig;
  docs?: DocsConfig;
}

interface WorkConfig {
  provider: 'github' | 'jira' | 'linear';
  config: GitHubConfig | JiraConfig | LinearConfig;
}

interface RepoConfig {
  provider: 'github' | 'gitlab' | 'bitbucket';
  config: GitHubRepoConfig | GitLabConfig | BitbucketConfig;
}

interface SpecConfig {
  directory: string;
  template?: string;
  autoValidate?: boolean;
}

interface LogsConfig {
  directory: string;
  level?: 'debug' | 'info' | 'warn' | 'error';
  redactSensitive?: boolean;
  maxAgeDays?: number;
}

interface FileConfig {
  baseDirectory: string;
  allowedPatterns?: string[];
}

interface DocsConfig {
  directory: string;
  format?: 'markdown' | 'html' | 'text';
  defaultTags?: string[];
}
```

## Troubleshooting

### Configuration not loading

```bash
# Check current configuration
fractary-core config show

# Validate configuration file
fractary-core config validate

# Check environment variables
env | grep FRACTARY
```

### Token authentication fails

```bash
# Test GitHub token
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user

# Test Jira credentials
curl -u "$JIRA_EMAIL:$JIRA_TOKEN" https://myorg.atlassian.net/rest/api/3/myself
```

### Configuration conflicts

```bash
# Clear cached configuration
rm -rf .fractary/.cache

# Reset to defaults
fractary-core config reset

# Reinitialize
fractary-core work init --provider github
```

## Best Practices

1. **Use environment variables for secrets** - Never commit tokens to version control
2. **Use configuration files for settings** - Keep project-specific settings in `.fractary/`
3. **Document required variables** - List all required environment variables in README
4. **Validate configuration** - Run `config validate` before deployment
5. **Use different configs per environment** - Separate staging and production configs
6. **Version control config templates** - Commit `.fractary/core/config.example.yaml` with placeholder values

## Migration Guide

### Migrating from v1.x to v2.0

v2.0 introduces a **breaking change** with the unified YAML configuration system. All projects must be re-initialized.

#### What Changed

**Before (v1.x):**
- Multiple config files: `.fractary/plugins/{name}/config.json`
- JSON format
- Per-plugin initialization

**After (v2.0):**
- Single config file: `.fractary/core/config.yaml`
- YAML format only
- Unified initialization command
- Handler pattern for multi-platform support
- Environment variable substitution: `${VAR_NAME}`

#### Migration Steps

**1. Backup Existing Configuration**

```bash
# Backup your entire .fractary directory
tar czf fractary-backup-$(date +%Y%m%d).tar.gz .fractary/
```

**2. Upgrade to v2.0**

```bash
# Update CLI
npm install -g @fractary/core-cli@2.0.0

# Or update in your project
npm install @fractary/core@2.0.0
```

**3. Remove Old Config (Optional)**

```bash
# Move old config out of the way
mv .fractary .fractary.v1
```

**4. Initialize with New Config**

```bash
# Initialize all plugins
fractary-core:init

# Or specify platforms
fractary-core:init \
  --work-platform github \
  --repo-platform github \
  --file-handler local
```

**5. Manually Merge Custom Settings**

Compare your old and new configs:

```bash
# View old work config
cat .fractary.v1/plugins/work/config.json | jq .

# View new work config
yq e '.work' .fractary/core/config.yaml

# Edit new config to add custom settings
vim .fractary/core/config.yaml
```

**6. Validate New Configuration**

```bash
# Validate YAML syntax and required fields
fractary-core config validate

# View redacted config
fractary-core config show
```

**7. Test All Plugins**

```bash
# Test work plugin
fractary-work:issue list

# Test repo plugin
fractary-repo:branch list

# Test other plugins
fractary-spec:list
fractary-logs:search --query "test"
```

**8. Clean Up (Optional)**

Once everything works:

```bash
# Remove old config backup
rm -rf .fractary.v1
```

#### Configuration Mapping

##### Work Plugin

**Old (v1.x):** `.fractary/plugins/work/config.json`
```json
{
  "platform": "github",
  "owner": "myorg",
  "repo": "myrepo",
  "token": "ghp_..."
}
```

**New (v2.0):** `.fractary/core/config.yaml`
```yaml
work:
  active_handler: github
  handlers:
    github:
      owner: myorg
      repo: myrepo
      token: ${GITHUB_TOKEN}
      api_url: https://api.github.com
```

##### Repo Plugin

**Old (v1.x):** `.fractary/plugins/repo/config.json`
```json
{
  "platform": "github",
  "token": "ghp_..."
}
```

**New (v2.0):** `.fractary/core/config.yaml`
```yaml
repo:
  active_handler: github
  handlers:
    github:
      token: ${GITHUB_TOKEN}
      api_url: https://api.github.com
  defaults:
    default_branch: main
```

##### Spec Plugin

**Old (v1.x):** `.fractary/plugins/spec/config.json`
```json
{
  "local_path": "/specs"
}
```

**New (v2.0):** `.fractary/core/config.yaml`
```yaml
spec:
  schema_version: "1.0"
  storage:
    local_path: /specs
```

#### Deprecated Commands

The following init commands are deprecated and delegate to unified init:

- `fractary-work:init` → Use `fractary-core:init --plugins work`
- `fractary-repo:init` → Use `fractary-core:init --plugins repo`
- `fractary-logs:init` → Use `fractary-core:init --plugins logs`
- `fractary-file:init` → Use `fractary-core:init --plugins file`
- `fractary-spec:init` → Use `fractary-core:init --plugins spec`

#### Common Migration Issues

**Issue**: Config validation fails with "Missing version field"

**Solution**: Add `version: "2.0"` at the top of your config file.

**Issue**: Environment variables not being substituted

**Solution**: Use the correct syntax: `${VAR_NAME}` or `${VAR_NAME:-default}`

**Issue**: Old plugin configs still being read

**Solution**: Remove old config files:
```bash
rm -rf .fractary/plugins/*/config.json
```

**Issue**: "Configuration file not found" error

**Solution**: Ensure config is at `.fractary/core/config.yaml` (not `.fractary/core.yaml`)

#### Breaking Changes Summary

**Removed:**
- Individual plugin config files (`.fractary/plugins/{name}/config.json`)
- JSON config support (`.fractary/core.json`)
- Automatic migration from v1.x
- Per-plugin init commands (now deprecated wrappers)

**Changed:**
- Config location: `.fractary/core.yaml` → `.fractary/core/config.yaml`
- Config format: JSON → YAML
- Init command: Plugin-specific → Unified `fractary-core:init`

**Added:**
- Handler pattern for multi-platform support
- Environment variable substitution (`${VAR_NAME}`)
- Config validation command (`fractary-core config validate`)
- Config display command (`fractary-core config show`)
- Unified initialization for all plugins

#### Getting Help

If you encounter migration issues:

1. Check the example config: `.fractary/core/config.example.yaml`
2. Run validation: `fractary-core config validate`
3. Review docs: `docs/guides/configuration.md`
4. Report issues: https://github.com/fractary/core/issues

## Next Steps

- [API Reference](./api-reference.md) - Complete API documentation
- [Integration Guide](./integration.md) - Integration patterns
- [Examples](../examples/) - Configuration examples
