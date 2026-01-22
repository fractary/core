# Configuration Guide

Complete reference for configuring Fractary Core using the unified `.fractary/config.yaml` configuration file.

## Overview

Fractary Core v2.0 uses a unified YAML configuration system. All toolsets are configured in a single file at `.fractary/config.yaml`.

### Key Features

- **Unified Configuration**: Single file for all toolsets
- **YAML Format**: Human-readable configuration
- **Environment Variables**: Support for `${VAR_NAME}` and `${VAR_NAME:-default}` syntax
- **Handler Pattern**: Easy switching between platforms
- **Auto-Detection**: Detects repository settings automatically

## Quick Start

Initialize configuration:

```bash
fractary-core:configure
```

Or with specific options:

```bash
fractary-core:configure \
  --work-platform github \
  --repo-platform github \
  --file-handler local
```

## Configuration File Location

```
.fractary/config.yaml
```

## Basic Structure

```yaml
version: "2.0"

# Each toolset follows the handler pattern
<toolset>:
  active_handler: <handler_name>
  handlers:
    <handler_name>:
      # Handler-specific configuration
      token: ${ENV_VAR}
  defaults:
    # Toolset-specific defaults
```

## Complete Example

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
    jira:
      host: https://myorg.atlassian.net
      email: user@example.com
      token: ${JIRA_TOKEN}
      project: PROJ
    linear:
      api_key: ${LINEAR_API_KEY}
      team_id: my-team

repo:
  active_handler: github
  handlers:
    github:
      token: ${GITHUB_TOKEN}
      api_url: https://api.github.com
    gitlab:
      token: ${GITLAB_TOKEN}
      project_id: 12345
    bitbucket:
      username: ${BITBUCKET_USERNAME}
      app_password: ${BITBUCKET_APP_PASSWORD}
      workspace: myworkspace
  defaults:
    default_branch: main
    branch_naming:
      pattern: "{prefix}/{issue_id}-{slug}"

spec:
  schema_version: "1.0"
  storage:
    local_path: /specs
  defaults:
    template: feature

logs:
  schema_version: "2.0"
  storage:
    local_path: /logs
  session_logging:
    enabled: true
    redact_sensitive: true
  retention:
    max_age_days: 90

file:
  schema_version: "1.0"
  active_handler: local
  handlers:
    local:
      base_path: .
      create_directories: true
    s3:
      bucket: my-bucket
      region: us-east-1
      prefix: data/

docs:
  schema_version: "1.1"
  doc_types:
    adr:
      enabled: true
      path: docs/architecture/ADR
    api:
      enabled: true
      path: docs/api
    guide:
      enabled: true
      path: docs/guides
```

## Toolset Configuration

### Work

Work tracking configuration for GitHub Issues, Jira, and Linear.

```yaml
work:
  active_handler: github  # github | jira | linear
  handlers:
    github:
      owner: myorg           # Repository owner
      repo: myrepo           # Repository name
      token: ${GITHUB_TOKEN} # Personal access token
      api_url: https://api.github.com  # For GitHub Enterprise
    jira:
      host: https://myorg.atlassian.net
      email: user@example.com
      token: ${JIRA_TOKEN}   # API token
      project: PROJ          # Project key
    linear:
      api_key: ${LINEAR_API_KEY}
      team_id: my-team
```

**Environment Variables:**
```bash
export GITHUB_TOKEN=ghp_your_token
export JIRA_TOKEN=your_jira_token
export LINEAR_API_KEY=lin_api_your_key
```

### Repo

Repository management configuration.

```yaml
repo:
  active_handler: github  # github | gitlab | bitbucket
  handlers:
    github:
      token: ${GITHUB_TOKEN}
      api_url: https://api.github.com
    gitlab:
      token: ${GITLAB_TOKEN}
      project_id: 12345
      base_url: https://gitlab.com/api/v4
    bitbucket:
      username: ${BITBUCKET_USERNAME}
      app_password: ${BITBUCKET_APP_PASSWORD}
      workspace: myworkspace
  defaults:
    default_branch: main
    branch_naming:
      pattern: "{prefix}/{issue_id}-{slug}"
      prefixes:
        feature: feature
        bugfix: bugfix
        hotfix: hotfix
```

**Environment Variables:**
```bash
export GITHUB_TOKEN=ghp_your_token
export GITLAB_TOKEN=glpat_your_token
export BITBUCKET_USERNAME=your_username
export BITBUCKET_APP_PASSWORD=your_app_password
```

### Spec

Specification management configuration.

```yaml
spec:
  schema_version: "1.0"
  storage:
    local_path: /specs       # Relative to project root
  defaults:
    template: feature        # basic | feature | bug | infrastructure | api
    auto_validate: true
  templates:
    feature:
      sections:
        - problem_statement
        - proposed_solution
        - acceptance_criteria
        - technical_approach
```

### Logs

Log management configuration.

```yaml
logs:
  schema_version: "2.0"
  storage:
    local_path: /logs
  session_logging:
    enabled: true
    redact_sensitive: true   # Redact tokens, passwords, etc.
    model: claude-3.5-sonnet
  retention:
    max_age_days: 90
    auto_archive: true
```

### File

File storage configuration.

```yaml
file:
  schema_version: "1.0"
  active_handler: local  # local | s3
  handlers:
    local:
      base_path: .           # Base directory
      create_directories: true
      allowed_patterns:      # Optional: restrict file types
        - "*.json"
        - "*.yaml"
        - "*.txt"
    s3:
      bucket: my-bucket
      region: us-east-1
      prefix: data/
      # Uses AWS credentials from environment
```

**Environment Variables for S3:**
```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1
```

### Docs

Documentation management configuration.

```yaml
docs:
  schema_version: "1.1"
  storage:
    local_path: /docs
  doc_types:
    adr:
      enabled: true
      path: docs/architecture/ADR
      template: adr
    api:
      enabled: true
      path: docs/api
    guide:
      enabled: true
      path: docs/guides
    readme:
      enabled: true
      path: .
  defaults:
    format: markdown
    default_tags:
      - project
```

## Environment Variables

### Variable Substitution

Use `${VAR_NAME}` syntax in configuration:

```yaml
work:
  handlers:
    github:
      token: ${GITHUB_TOKEN}          # Required
      owner: ${GITHUB_OWNER:-myorg}   # With default value
```

### Common Variables

```bash
# Work tracking
export GITHUB_TOKEN=ghp_your_token
export JIRA_TOKEN=your_jira_token
export LINEAR_API_KEY=lin_api_your_key

# Repository
export GITLAB_TOKEN=glpat_your_token
export BITBUCKET_USERNAME=your_username
export BITBUCKET_APP_PASSWORD=your_password

# AWS (for S3 storage)
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1

# Fractary settings
export FRACTARY_CONFIG=.fractary/config.yaml
export FRACTARY_LOG_LEVEL=info
```

## Configuration Precedence

Configuration is resolved in this order (highest priority first):

1. **CLI flags** - Command-line arguments
2. **Environment variables** - `FRACTARY_*` and platform-specific
3. **Configuration file** - `.fractary/config.yaml`
4. **Default values** - Built-in defaults

## Multiple Environments

Use different config files for different environments:

```
.fractary/
├── config.yaml          # Default/local
├── staging.yaml         # Staging environment
├── production.yaml      # Production environment
└── config.example.yaml  # Template (committed)
```

**Usage:**
```bash
# Use staging config
fractary-core --config .fractary/staging.yaml work issue list

# Use production config
fractary-core --config .fractary/production.yaml work issue create "Title"
```

## Validation

Validate your configuration:

```bash
# Validate configuration
fractary-core:configure --validate-only

# Show current configuration (with secrets redacted)
fractary-core config show

# Test provider connections
fractary-core config test
```

## Incremental Updates

Update configuration with natural language:

```bash
# Switch work tracking platform
fractary-core:configure --context "switch to jira for work tracking"

# Enable S3 storage
fractary-core:configure --context "enable S3 storage for file plugin"

# Add a new platform
fractary-core:configure --context "add gitlab as repo platform"
```

## Backup and Rollback

The configure command automatically:

- Creates timestamped backups before modifications
- Stores backups in `.fractary/backups/`
- Keeps the last 10 backups
- Rolls back automatically on failure

## Best Practices

1. **Never commit secrets** - Use environment variables for tokens
2. **Commit example config** - Include `.fractary/config.example.yaml` in version control
3. **Use different configs per environment** - Separate staging and production
4. **Validate before deployment** - Run `fractary-core config validate`
5. **Document required variables** - List all required environment variables in README

## Troubleshooting

### Configuration Not Loading

```bash
# Check current configuration
fractary-core config show

# Validate configuration file
fractary-core:configure --validate-only

# Check environment variables
env | grep FRACTARY
env | grep GITHUB
```

### Token Authentication Fails

```bash
# Test GitHub token
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user

# Test Jira credentials
curl -u "$JIRA_EMAIL:$JIRA_TOKEN" https://myorg.atlassian.net/rest/api/3/myself
```

### Configuration Conflicts

```bash
# Clear cached configuration
rm -rf .fractary/.cache

# Reinitialize
fractary-core:configure --force
```

## Related Documentation

- [SDK Configuration](/docs/sdk/README.md#configuration)
- [CLI Configuration](/docs/cli/README.md#configuration)
- [MCP Configuration](/docs/mcp/README.md#configuration)
- [Troubleshooting](/docs/guides/troubleshooting.md)
