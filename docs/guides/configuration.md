# Configuration Guide

Complete guide to configuring Fractary Core SDK, CLI, MCP server, and plugins.

## Table of Contents

- [Overview](#overview)
- [Configuration Files](#configuration-files)
- [SDK Configuration](#sdk-configuration)
- [CLI Configuration](#cli-configuration)
- [MCP Server Configuration](#mcp-server-configuration)
- [Plugin Configuration](#plugin-configuration)
- [Environment Variables](#environment-variables)
- [Platform-Specific Configuration](#platform-specific-configuration)

## Overview

Fractary Core supports multiple configuration methods:

1. **Configuration Files** - YAML or JSON files in `.fractary/`
2. **Environment Variables** - For credentials and runtime settings
3. **Programmatic Configuration** - Direct configuration in code
4. **CLI Flags** - Command-line overrides

Configuration is resolved in this order (highest priority first):
1. CLI flags
2. Environment variables
3. Project configuration files
4. Default values

## Configuration Files

### Project Configuration

Create `.fractary/core.yaml` in your project root:

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

const config = await loadConfig('.fractary/core.yaml');

const workManager = new WorkManager(config.work);
const repoManager = new RepoManager(config.repo);
```

## CLI Configuration

### Global Configuration

The CLI reads from `.fractary/core.yaml` or environment variables.

### Initialize Configuration

```bash
# Initialize work tracking
fractary-core work init --provider github

# This creates/updates .fractary/core.yaml
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
├── core.yaml           # Default/local
├── staging.yaml        # Staging environment
├── production.yaml     # Production environment
└── core-mcp.yaml      # MCP server config
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
2. **Configuration file** - `.fractary/core.yaml` or `.fractary/core.json`
3. **Environment variables** - `FRACTARY_*` variables
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
6. **Version control config templates** - Commit `.fractary/core.yaml.example` with placeholder values

## Next Steps

- [API Reference](./api-reference.md) - Complete API documentation
- [Integration Guide](./integration.md) - Integration patterns
- [Examples](../examples/) - Configuration examples
