# @fractary/core-cli

Command-line interface for Fractary Core SDK - work tracking, repository management, specifications, logging, file storage, and documentation.

## Installation

```bash
npm install -g @fractary/core-cli
```

## Usage

The CLI provides six main command categories:

```bash
fractary-core <command> [subcommand] [options]
```

### Work Tracking

Manage work items, issues, and project tasks:

```bash
# Fetch an issue
fractary-core work issue fetch 123

# Create a new issue
fractary-core work issue create --title "Add feature" --body "Description"

# Search issues
fractary-core work issue search --query "bug" --state open

# Add comment
fractary-core work comment create 123 --body "Fixed in PR #456"

# Manage labels
fractary-core work label add 123 --labels "bug,urgent"

# Initialize work tracking
fractary-core work init --platform github
```

### Repository Operations

Manage Git repositories, branches, commits, and pull requests:

```bash
# Create a branch
fractary-core repo branch create feature/new-feature

# Commit with conventional commits
fractary-core repo commit --message "Add login" --type feat --scope auth

# Create pull request
fractary-core repo pr create --title "Add feature" --body "Description"

# Manage tags
fractary-core repo tag create v1.0.0 --message "Release 1.0.0"

# Work with worktrees
fractary-core repo worktree create feature-branch

# Check status
fractary-core repo status
```

### Specification Management

Create and manage technical specifications:

```bash
# Create specification
fractary-core spec create "User Authentication" --template feature

# Validate specification
fractary-core spec validate SPEC-20241216

# List specifications
fractary-core spec list --status validated

# Generate refinement questions
fractary-core spec refine SPEC-20241216
```

### Log Management

Capture and manage operational logs:

```bash
# Start session capture
fractary-core logs capture 123 --model claude-3.5-sonnet

# Write log entry
fractary-core logs write --type build --title "Build" --content "Success"

# Search logs
fractary-core logs search --query "error" --type session

# Archive old logs
fractary-core logs archive --max-age 90
```

### File Storage

Manage file storage operations:

```bash
# Write file
fractary-core file write data.json --content '{"key":"value"}'

# Read file
fractary-core file read data.json

# List files
fractary-core file list --prefix "data/"

# Copy file
fractary-core file copy source.txt destination.txt
```

### Documentation Management

Create and manage documentation:

```bash
# Create document
fractary-core docs create guide-001 \
  --title "User Guide" \
  --content "..." \
  --format markdown \
  --tags "guide,user"

# Search documents
fractary-core docs search --text "authentication" --tags "api"

# List documents
fractary-core docs list --category "guides"
```

## Configuration

The CLI uses configuration files stored in `.fractary/core/config.json`:

```json
{
  "work": {
    "platform": "github",
    "repository": {
      "owner": "fractary",
      "name": "core"
    }
  },
  "repo": {
    "platform": "github"
  }
}
```

Initialize configuration for each plugin:

```bash
fractary-core work init --platform github
```

## JSON Output

All commands support `--json` flag for machine-readable output:

```bash
fractary-core work issue fetch 123 --json
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

### Work Commands

- `work issue fetch <number>` - Fetch issue details
- `work issue create` - Create new issue
- `work issue update <number>` - Update issue
- `work issue close <number>` - Close issue
- `work issue reopen <number>` - Reopen issue
- `work issue assign <number>` - Assign/unassign issue
- `work issue classify <number>` - Classify work type
- `work issue search` - Search issues
- `work comment create <number>` - Add comment
- `work comment list <number>` - List comments
- `work label add <number>` - Add labels
- `work label remove <number>` - Remove labels
- `work label list` - List all labels
- `work milestone create` - Create milestone
- `work milestone list` - List milestones
- `work milestone set <number>` - Set milestone
- `work init` - Initialize work tracking

### Repo Commands

- `repo branch create <name>` - Create branch
- `repo branch delete <name>` - Delete branch
- `repo branch list` - List branches
- `repo commit` - Create commit
- `repo pr create` - Create pull request
- `repo pr list` - List pull requests
- `repo pr merge <number>` - Merge pull request
- `repo pr review <number>` - Review pull request
- `repo tag create <name>` - Create tag
- `repo tag push <name>` - Push tag
- `repo tag list` - List tags
- `repo worktree create <branch>` - Create worktree
- `repo worktree list` - List worktrees
- `repo worktree remove <path>` - Remove worktree
- `repo worktree cleanup` - Clean up worktrees
- `repo status` - Show status
- `repo push` - Push to remote
- `repo pull` - Pull from remote

### Spec Commands

- `spec create <title>` - Create specification
- `spec get <id>` - Get specification
- `spec list` - List specifications
- `spec update <id>` - Update specification
- `spec validate <id>` - Validate specification
- `spec refine <id>` - Generate refinement questions
- `spec delete <id>` - Delete specification
- `spec templates` - List templates

### Logs Commands

- `logs capture <issue>` - Start session capture
- `logs stop` - Stop capture
- `logs write` - Write log entry
- `logs read <id>` - Read log entry
- `logs search` - Search logs
- `logs list` - List logs
- `logs archive` - Archive logs
- `logs delete <id>` - Delete log

### File Commands

- `file write <path>` - Write file
- `file read <path>` - Read file
- `file exists <path>` - Check existence
- `file list` - List files
- `file delete <path>` - Delete file
- `file copy <source> <dest>` - Copy file
- `file move <source> <dest>` - Move file

### Docs Commands

- `docs create <id>` - Create document
- `docs get <id>` - Get document
- `docs list` - List documents
- `docs update <id>` - Update document
- `docs delete <id>` - Delete document
- `docs search` - Search documents

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

## Related Projects

- [@fractary/core](../sdk/js) - Core SDK for JavaScript/TypeScript
- [fractary/core](../) - Fractary Core monorepo
