# @fractary/core-cli

Command-line interface for Fractary Core SDK - work tracking, repository management, specifications, logging, file storage, and documentation.

[![npm version](https://img.shields.io/npm/v/@fractary/core-cli.svg)](https://www.npmjs.com/package/@fractary/core-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

The Fractary Core CLI provides command-line access to all core operations including configuration management, work tracking, repository management, specification management, logging, file storage, and documentation. It is designed for automation, scripting, and CI/CD integration.

### Key Features

- **7 Command Modules**: config, work, repo, spec, logs, file, docs
- **Multi-Platform Support**: GitHub, GitLab, Bitbucket, Jira, Linear
- **JSON Output**: Machine-readable output for scripting (`--json` flag on all commands)
- **YAML Configuration**: Unified configuration at `.fractary/config.yaml`
- **Environment Management**: Switch between dev, staging, and production environments

## Installation

```bash
# Install globally
npm install -g @fractary/core-cli

# Or use with npx (no installation required)
npx @fractary/core-cli [command]
```

## Usage

The CLI provides seven main command categories with dash-separated subcommand names:

```bash
fractary-core <module> <command> [arguments] [options]
```

### Configuration

Manage Fractary Core configuration and environments:

```bash
# Initialize configuration
fractary-core config configure --work-platform github --file-handler local

# Validate configuration
fractary-core config validate

# Show configuration (sensitive values redacted)
fractary-core config show

# Switch environment
fractary-core config env-switch prod

# List available environments
fractary-core config env-list

# Show current environment status
fractary-core config env-show

# Clear environment credentials
fractary-core config env-clear
```

### Work Tracking

Manage work items, issues, comments, and labels:

```bash
# Fetch an issue
fractary-core work issue-fetch 123

# Create a new issue
fractary-core work issue-create --title "Add feature" --body "Description"

# Search issues
fractary-core work issue-search --query "bug" --state open

# Add a comment
fractary-core work issue-comment 123 --body "Fixed in PR #456"

# List comments
fractary-core work issue-comment-list 123

# Manage labels
fractary-core work label-add 123 --labels "bug,urgent"
fractary-core work label-remove 123 --labels "wontfix"
fractary-core work label-list

# Classify work type
fractary-core work issue-classify 123

# Configure work tracking
fractary-core work configure --platform github
```

### Repository Operations

Manage Git repositories, branches, commits, pull requests, tags, and worktrees:

```bash
# Create a branch
fractary-core repo branch-create feature/new-feature --base main --checkout

# Commit with conventional commits
fractary-core repo commit --message "Add login" --type feat --scope auth

# Create pull request
fractary-core repo pr-create --title "Add feature" --body "Description" --draft

# Merge pull request
fractary-core repo pr-merge 42 --strategy squash --delete-branch

# Manage tags
fractary-core repo tag-create v1.0.0 --message "Release 1.0.0"
fractary-core repo tag-push v1.0.0

# Work with worktrees
fractary-core repo worktree-create feature-branch --base main

# Check status, push, and pull
fractary-core repo status
fractary-core repo push --set-upstream
fractary-core repo pull --rebase
```

### Specification Management

Create and manage technical specifications:

```bash
# Create specification
fractary-core spec spec-create-file "User Authentication" --template feature

# Get specification
fractary-core spec spec-get SPEC-00123

# List specifications
fractary-core spec spec-list --status validated

# Validate specification structure
fractary-core spec spec-validate-check SPEC-00123

# Scan for refinement gaps
fractary-core spec spec-refine-scan SPEC-00123

# Archive specs for a completed issue
fractary-core spec spec-archive 123

# List available templates
fractary-core spec template-list
```

### Log Management

Capture and manage operational logs with typed schemas:

```bash
# List available log types
fractary-core logs types

# Get log type definition
fractary-core logs type-info session

# Validate a log file against its type schema
fractary-core logs validate ./logs/session-2024-01-15.md

# Start session capture
fractary-core logs capture 123 --model claude-sonnet-4-6

# Stop session capture
fractary-core logs stop

# Write log entry
fractary-core logs write --type build --title "Build" --content "Success"

# Read a log entry
fractary-core logs read log-abc123

# Search logs
fractary-core logs search --query "error" --type session

# List logs
fractary-core logs list --type build --limit 20

# Archive old logs
fractary-core logs archive --max-age 90 --compress

# Delete a log
fractary-core logs delete log-abc123
```

### File Storage

Manage file storage operations with multi-source support:

```bash
# Upload a local file
fractary-core file upload ./data.json --remote-path "backups/data.json"

# Download a file
fractary-core file download "backups/data.json" --local-path ./data.json

# Write content directly
fractary-core file write data.json --content '{"key":"value"}'

# Read file content
fractary-core file read data.json

# List files
fractary-core file list --prefix "data/"

# Check if file exists
fractary-core file exists data.json

# Copy and move files
fractary-core file copy source.txt destination.txt
fractary-core file move old-path.txt new-path.txt

# Get a URL for a file
fractary-core file get-url report.pdf --expires-in 3600

# Show file plugin configuration
fractary-core file show-config

# Test storage connection
fractary-core file test-connection --source my-s3-bucket
```

### Documentation Management

Create and manage typed documentation:

```bash
# Create document
fractary-core docs doc-create guide-001 \
  --title "User Guide" \
  --content "..." \
  --format markdown \
  --doc-type api \
  --tags "guide,user"

# Get a document
fractary-core docs doc-get guide-001

# Search documents
fractary-core docs doc-search --text "authentication" --tags "api" --doc-type adr

# List documents
fractary-core docs doc-list --category "guides"

# Update a document
fractary-core docs doc-update guide-001 --content "..." --title "Updated Guide"

# Delete a document
fractary-core docs doc-delete guide-001

# Archive a document
fractary-core docs doc-archive guide-001

# Scan for gaps and refinement areas
fractary-core docs doc-refine-scan guide-001

# Validate implementation fulfillment
fractary-core docs doc-validate-fulfillment spec-001

# List available document types
fractary-core docs type-list

# Get document type details
fractary-core docs type-info adr --template
```

## Configuration

The CLI uses a unified YAML configuration file at `.fractary/config.yaml`:

```yaml
version: "2.0"

work:
  active_handler: github
  handlers:
    github:
      owner: fractary
      repo: core
      token: ${GITHUB_TOKEN}

repo:
  active_handler: github
  handlers:
    github:
      owner: fractary
      repo: core
      token: ${GITHUB_TOKEN}
      merge:
        strategy: squash  # options: squash, merge, rebase

file:
  active_handler: local
  handlers:
    local:
      base_path: .fractary/files
```

Initialize configuration:

```bash
fractary-core config configure --work-platform github --file-handler local
```

Environment variables are referenced using `${VAR_NAME}` syntax in the config file and resolved at runtime from `.env` files. Manage environments with `config env-*` commands.

## JSON Output

All commands support the `--json` flag for machine-readable output:

```bash
fractary-core work issue-fetch 123 --json
```

Output format:

```json
{
  "status": "success",
  "data": {
    "number": 123,
    "title": "Issue title",
    "state": "open"
  }
}
```

Error output format:

```json
{
  "status": "error",
  "error": {
    "code": "NOT_FOUND",
    "message": "Issue not found: 999"
  }
}
```

## Programmatic Usage

Import and use CLI components programmatically:

```typescript
import { getWorkManager, createWorkCommand } from '@fractary/core-cli';

// Use SDK managers directly
const workManager = await getWorkManager();
const issue = await workManager.fetchIssue(123);

// Or compose custom CLI tools
import { Command } from 'commander';

const program = new Command();
program.addCommand(createWorkCommand());
program.parse();
```

## Command Reference

### Config Commands

| Command | Description |
|---------|-------------|
| `config configure` | Initialize or update `.fractary/config.yaml` |
| `config validate` | Validate `.fractary/config.yaml` |
| `config show` | Display configuration (sensitive values redacted) |
| `config env-switch <name>` | Switch to a different environment |
| `config env-list` | List available environments |
| `config env-show` | Show current environment status |
| `config env-clear` | Clear environment credentials |

### Work Commands

| Command | Description |
|---------|-------------|
| `work issue-fetch <number>` | Fetch a work item by ID |
| `work issue-create` | Create a new work item |
| `work issue-update <number>` | Update a work item |
| `work issue-close <number>` | Close a work item |
| `work issue-reopen <number>` | Reopen a closed work item |
| `work issue-assign <number>` | Assign or unassign a work item |
| `work issue-classify <number>` | Classify work item type (feature, bug, chore, patch) |
| `work issue-search` | Search work items |
| `work issue-comment <number>` | Add a comment to a work item |
| `work issue-comment-list <number>` | List comments on a work item |
| `work label-add <number>` | Add labels to a work item |
| `work label-remove <number>` | Remove labels from a work item |
| `work label-list` | List all available labels |
| `work configure` | Configure work tracking settings |

### Repo Commands

| Command | Description |
|---------|-------------|
| `repo branch-create <name>` | Create a new branch |
| `repo branch-delete <name>` | Delete a branch |
| `repo branch-list` | List branches |
| `repo commit` | Create a commit with conventional commit format |
| `repo pr-create` | Create a new pull request |
| `repo pr-list` | List pull requests |
| `repo pr-merge <number>` | Merge a pull request |
| `repo pr-review <number>` | Review a pull request |
| `repo tag-create <name>` | Create a new tag |
| `repo tag-push <name>` | Push tag(s) to remote |
| `repo tag-list` | List tags |
| `repo worktree-create <branch>` | Create a new worktree |
| `repo worktree-list` | List worktrees |
| `repo worktree-remove <path>` | Remove a worktree |
| `repo worktree-cleanup` | Clean up stale worktrees |
| `repo status` | Show repository status |
| `repo push` | Push commits to remote |
| `repo pull` | Pull changes from remote |

### Spec Commands

| Command | Description |
|---------|-------------|
| `spec spec-create-file <title>` | Create a new specification file |
| `spec spec-get <id>` | Get a specification by ID or path |
| `spec spec-list` | List specifications |
| `spec spec-update <id>` | Update a specification |
| `spec spec-delete <id>` | Delete a specification |
| `spec spec-validate-check <id>` | Run structural validation checks |
| `spec spec-refine-scan <id>` | Scan for structural gaps and refinement areas |
| `spec spec-archive <issue_number>` | Archive specifications for a completed issue |
| `spec template-list` | List available specification templates |

### Logs Commands

| Command | Description |
|---------|-------------|
| `logs types` | List available log types |
| `logs type-info <type>` | Get log type definition |
| `logs validate <file>` | Validate a log file against its type schema |
| `logs capture <issue_number>` | Start session capture |
| `logs stop` | Stop session capture |
| `logs write` | Write a log entry |
| `logs read <id>` | Read a log entry |
| `logs search` | Search logs |
| `logs list` | List logs |
| `logs archive` | Archive old logs |
| `logs delete <id>` | Delete a log entry |

### File Commands

| Command | Description |
|---------|-------------|
| `file upload <local-path>` | Upload a local file to storage |
| `file download <remote-path>` | Download a file from storage to local path |
| `file write <path>` | Write content to a storage path |
| `file read <path>` | Read content from a storage path |
| `file list` | List files in storage |
| `file delete <path>` | Delete a file from storage |
| `file exists <path>` | Check if a file exists in storage |
| `file copy <src> <dest>` | Copy a file within storage |
| `file move <src> <dest>` | Move a file within storage |
| `file get-url <path>` | Get a URL for a file in storage |
| `file show-config` | Show file plugin configuration |
| `file test-connection` | Test storage connection |

### Docs Commands

| Command | Description |
|---------|-------------|
| `docs doc-create <id>` | Create a new document |
| `docs doc-get <id>` | Get a document |
| `docs doc-list` | List documents |
| `docs doc-update <id>` | Update a document |
| `docs doc-delete <id>` | Delete a document |
| `docs doc-search` | Search documents |
| `docs doc-archive <id>` | Archive a document |
| `docs doc-refine-scan <id>` | Scan for gaps and generate refinement questions |
| `docs doc-validate-fulfillment <id>` | Validate implementation fulfillment |
| `docs type-list` | List available document types |
| `docs type-info <type>` | Get detailed info about a document type |

## Platform Support

### Work Tracking
- **GitHub Issues** - Full support
- **Jira Cloud** - Basic support
- **Linear** - Basic support

### Repository Management
- **GitHub** - Full support
- **GitLab** - Planned
- **Bitbucket** - Planned

## Requirements

- Node.js >= 18.0.0
- Git (for repository operations)

## License

MIT

## Documentation

- **[Complete CLI Reference](../../README.md#cli)** - Full command documentation
- **[Configuration Guide](../../docs/guides/configuration.md)** - Configuration options
- **[Integration Guide](../../docs/guides/integration.md)** - CI/CD integration
- **[Examples](../../docs/examples/)** - Usage examples and scripts

## Related Packages

- **[@fractary/core](../sdk/js/)** - Core SDK for JavaScript/TypeScript
- **[@fractary/core-mcp](../mcp/server/)** - MCP server for AI agents

## Links

- [GitHub Repository](https://github.com/fractary/core)
- [Issue Tracker](https://github.com/fractary/core/issues)
- [NPM Package](https://www.npmjs.com/package/@fractary/core-cli)
