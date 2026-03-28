# CLI

Command-line interface for all Fractary Core toolsets.

**Package:** `@fractary/core-cli`

## Installation

```bash
npm install -g @fractary/core-cli
```

## Usage

```bash
fractary-core <module> <command> [arguments] [options]
```

All commands use dash-separated names (e.g., `issue-fetch`, `pr-merge`, `doc-create`).

## Global Options

| Option | Description |
|--------|-------------|
| `--json` | Output as structured JSON (available on all commands) |
| `--help` | Show help for any command |
| `--version` | Show CLI version |

## JSON Output Format

All commands support `--json` for structured output:

```json
// Success
{ "status": "success", "data": { ... } }

// Error
{ "status": "error", "error": { "code": "ERROR_CODE", "message": "Human-readable error message" } }
```

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | General error |
| `3` | Resource not found / validation failure |

## Config Commands

Manage Fractary Core configuration (`.fractary/config.yaml`).

### config configure

Initialize or update configuration.

```bash
fractary-core config configure [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `--work-platform <platform>` | `github`, `jira`, `linear` | `github` |
| `--file-handler <handler>` | `local`, `s3` | `local` |
| `--owner <owner>` | GitHub/GitLab owner | |
| `--repo <repo>` | Repository name | |
| `--s3-bucket <bucket>` | S3 bucket name | |
| `--aws-region <region>` | AWS region | `us-east-1` |
| `--minimal` | Create minimal config | |
| `--force` | Overwrite existing | |

### config validate

```bash
fractary-core config validate [--verbose]
```

### config show

Display configuration with sensitive values redacted.

```bash
fractary-core config show
```

### config env-switch

Switch to a different environment.

```bash
fractary-core config env-switch <name> [--clear]
```

### config env-list / env-show

```bash
fractary-core config env-list
fractary-core config env-show
```

## Environment Variables

```bash
# GitHub
export GITHUB_TOKEN=ghp_your_token

# Jira
export JIRA_TOKEN=your_jira_token

# Linear
export LINEAR_API_KEY=lin_api_your_key

# AWS (for S3/R2 file storage)
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
```

## Feature References

For detailed command documentation per toolset, see the feature docs:

- **[Work Tracking](../features/work.md)** - `fractary-core work` commands
- **[Repository Management](../features/repo.md)** - `fractary-core repo` commands
- **[File Storage](../features/file.md)** - `fractary-core file` commands
- **[Log Management](../features/logs.md)** - `fractary-core logs` commands
- **[Documentation](../features/docs.md)** - `fractary-core docs` commands
