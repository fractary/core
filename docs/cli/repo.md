# Repo Toolset - CLI Reference

Command-line reference for the Repo toolset. Repository and Git operations.

## Command Structure

```bash
fractary-core repo <resource> <action> [options]
```

## Branch Commands

### repo branch create

Create a new branch.

```bash
fractary-core repo branch create <name> [options]
```

**Arguments:**
- `name` - Branch name

**Options:**
- `--base <branch>` - Base branch (default: main)
- `--checkout` - Checkout after creation

**Examples:**
```bash
# Create feature branch
fractary-core repo branch create feature/auth

# Create from develop branch
fractary-core repo branch create feature/auth --base develop --checkout
```

### repo branch delete

Delete a branch.

```bash
fractary-core repo branch delete <name> [options]
```

**Arguments:**
- `name` - Branch name

**Options:**
- `--force` - Force delete unmerged branch
- `--remote` - Also delete remote branch

**Examples:**
```bash
# Delete local branch
fractary-core repo branch delete feature/old-feature

# Delete local and remote
fractary-core repo branch delete feature/old-feature --remote
```

### repo branch list

List branches.

```bash
fractary-core repo branch list [options]
```

**Options:**
- `--remote` - Include remote branches
- `--merged` - Only merged branches
- `--format <type>` - Output format

### repo branch generate

Generate a semantic branch name.

```bash
fractary-core repo branch generate [options]
```

**Options:**
- `--type <type>` - Branch type: `feature`, `bugfix`, `hotfix`, `release`
- `--description <text>` - Brief description
- `--work-id <id>` - Associated work item ID

**Example:**
```bash
fractary-core repo branch generate \
  --type feature \
  --description "user authentication" \
  --work-id 123
# Output: feature/123-user-authentication
```

## Commit Commands

### repo commit

Create a commit.

```bash
fractary-core repo commit [options]
```

**Options:**
- `--message <text>` - Commit message (required)
- `--type <type>` - Conventional commit type: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`
- `--scope <scope>` - Commit scope
- `--breaking` - Mark as breaking change
- `--body <text>` - Extended description
- `--files <files>` - Files to stage (comma-separated)

**Examples:**
```bash
# Simple commit
fractary-core repo commit --message "Add login form"

# Conventional commit
fractary-core repo commit \
  --message "Add JWT authentication" \
  --type feat \
  --scope auth

# Breaking change
fractary-core repo commit \
  --message "Change API response format" \
  --type feat \
  --breaking
```

### repo stage

Stage files.

```bash
fractary-core repo stage <files>
```

**Arguments:**
- `files` - Files to stage (comma-separated or glob patterns)

**Examples:**
```bash
# Stage specific files
fractary-core repo stage src/auth.ts,tests/auth.test.ts

# Stage all
fractary-core repo stage --all
```

### repo push

Push to remote.

```bash
fractary-core repo push [options]
```

**Options:**
- `--remote <name>` - Remote name (default: origin)
- `--branch <name>` - Branch name
- `--force` - Force push
- `--set-upstream` - Set upstream tracking

### repo pull

Pull from remote.

```bash
fractary-core repo pull [options]
```

**Options:**
- `--remote <name>` - Remote name
- `--branch <name>` - Branch name
- `--rebase` - Rebase instead of merge

## Pull Request Commands

### repo pr create

Create a pull request.

```bash
fractary-core repo pr create [options]
```

**Options:**
- `--title <text>` - PR title (required)
- `--body <text>` - PR description
- `--base <branch>` - Target branch (default: main)
- `--head <branch>` - Source branch (default: current)
- `--draft` - Create as draft

**Examples:**
```bash
# Create PR
fractary-core repo pr create \
  --title "Add authentication system" \
  --body "Implements JWT authentication"

# Create draft PR
fractary-core repo pr create \
  --title "WIP: New feature" \
  --draft
```

### repo pr merge

Merge a pull request.

```bash
fractary-core repo pr merge <number> [options]
```

**Arguments:**
- `number` - PR number

**Options:**
- `--method <method>` - Merge method: `merge`, `squash`, `rebase`
- `--delete-branch` - Delete branch after merge

**Example:**
```bash
fractary-core repo pr merge 42 --method squash --delete-branch
```

### repo pr list

List pull requests.

```bash
fractary-core repo pr list [options]
```

**Options:**
- `--state <state>` - Filter by state: `open`, `closed`, `all`
- `--author <user>` - Filter by author
- `--format <type>` - Output format

### repo pr view

View pull request details.

```bash
fractary-core repo pr view <number>
```

## Tag Commands

### repo tag create

Create a tag.

```bash
fractary-core repo tag create <name> [options]
```

**Arguments:**
- `name` - Tag name

**Options:**
- `--message <text>` - Tag message (creates annotated tag)
- `--sha <commit>` - Commit to tag (default: HEAD)

**Example:**
```bash
fractary-core repo tag create v1.0.0 --message "Release version 1.0.0"
```

### repo tag delete

Delete a tag.

```bash
fractary-core repo tag delete <name> [options]
```

**Options:**
- `--remote` - Also delete from remote

### repo tag push

Push a tag to remote.

```bash
fractary-core repo tag push <name> [options]
```

**Options:**
- `--remote <name>` - Remote name

### repo tag list

List tags.

```bash
fractary-core repo tag list [options]
```

**Options:**
- `--format <type>` - Output format

## Worktree Commands

### repo worktree create

Create a git worktree.

```bash
fractary-core repo worktree create [options]
```

**Options:**
- `--path <path>` - Worktree path
- `--branch <name>` - Branch to checkout
- `--create-branch` - Create branch if doesn't exist

**Example:**
```bash
fractary-core repo worktree create \
  --path ../myrepo-feature \
  --branch feature/parallel-work \
  --create-branch
```

### repo worktree list

List worktrees.

```bash
fractary-core repo worktree list
```

### repo worktree remove

Remove a worktree.

```bash
fractary-core repo worktree remove <path> [options]
```

**Options:**
- `--force` - Force remove even if dirty

### repo worktree prune

Clean up stale worktrees.

```bash
fractary-core repo worktree prune [options]
```

**Options:**
- `--dry-run` - Preview without removing

## Workflow Commands

### repo commit-push

Commit and push in one command.

```bash
fractary-core repo commit-push [options]
```

Uses same options as `repo commit`, plus:
- `--set-upstream` - Set upstream if needed

### repo commit-push-pr

Commit, push, and create PR.

```bash
fractary-core repo commit-push-pr [options]
```

Combines options from `repo commit` and `repo pr create`.

**Example:**
```bash
fractary-core repo commit-push-pr \
  --message "Add authentication" \
  --type feat \
  --title "Feature: Authentication System" \
  --body "Implements JWT authentication"
```

## Environment Variables

```bash
# Provider selection
export FRACTARY_REPO_PROVIDER=github

# GitHub credentials
export GITHUB_TOKEN=ghp_your_token

# GitLab credentials
export GITLAB_TOKEN=glpat_your_token

# Bitbucket credentials
export BITBUCKET_USERNAME=your_username
export BITBUCKET_APP_PASSWORD=your_app_password
```

## Other Interfaces

- **SDK:** [Repo API](/docs/sdk/js/repo.md)
- **MCP:** [Repo Tools](/docs/mcp/server/repo.md)
- **Plugin:** [Repo Plugin](/docs/plugins/repo.md)
- **Configuration:** [Repo Config](/docs/guides/configuration.md#repo-toolset)
