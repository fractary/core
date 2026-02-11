# Fractary Core CLI Reference

Complete command reference for `@fractary/core-cli` with all arguments and options.

## Installation

```bash
npm install -g @fractary/core-cli
```

## Usage

```bash
fractary-core <module> <command> [arguments] [options]
```

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

---

## Config Commands

Manage Fractary Core configuration (`.fractary/config.yaml`).

### `config configure`

Initialize or update `.fractary/config.yaml`.

```bash
fractary-core config configure [options]
```

| Option | Value | Description | Default |
|--------|-------|-------------|---------|
| `--work-platform` | `<platform>` | Work tracking platform (`github`\|`jira`\|`linear`) | `github` |
| `--file-handler` | `<handler>` | File storage handler (`local`\|`s3`) | `local` |
| `--owner` | `<owner>` | GitHub/GitLab owner/organization | |
| `--repo` | `<repo>` | Repository name | |
| `--s3-bucket` | `<bucket>` | S3 bucket name (if using S3) | |
| `--aws-region` | `<region>` | AWS region (if using S3) | `us-east-1` |
| `--minimal` | | Create minimal config (work + repo only) | |
| `--force` | | Overwrite existing configuration | |

**Examples:**
```bash
fractary-core config configure --owner myorg --repo myrepo
fractary-core config configure --work-platform jira --file-handler s3 --s3-bucket my-bucket
fractary-core config configure --minimal --owner myorg --repo myrepo
fractary-core config configure --force
```

### `config validate`

Validate the configuration file.

```bash
fractary-core config validate [options]
```

| Option | Short | Description |
|--------|-------|-------------|
| `--verbose` | `-v` | Show detailed validation output |

### `config show`

Display configuration with sensitive values redacted.

```bash
fractary-core config show
```

### `config env-switch`

Switch to a different environment.

```bash
fractary-core config env-switch <name> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<name>` | Yes | Environment name (e.g., `test`, `staging`, `prod`) |

| Option | Description |
|--------|-------------|
| `--clear` | Clear credentials before switching |

### `config env-list`

List available environments.

```bash
fractary-core config env-list
```

### `config env-show`

Show current environment status.

```bash
fractary-core config env-show
```

### `config env-clear`

Clear environment credentials.

```bash
fractary-core config env-clear [options]
```

| Option | Value | Description |
|--------|-------|-------------|
| `--vars` | `<vars>` | Comma-separated list of specific variables to clear |

---

## Work Commands

Work item and issue tracking across platforms.

### `work issue-fetch`

Fetch a work item by ID.

```bash
fractary-core work issue-fetch <number> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<number>` | Yes | Issue number |

| Option | Description |
|--------|-------------|
| `--verbose` | Show additional details |
| `--json` | Output as JSON |

**Example:**
```bash
fractary-core work issue-fetch 123
fractary-core work issue-fetch 123 --verbose --json
```

### `work issue-create`

Create a new work item.

```bash
fractary-core work issue-create [options]
```

| Option | Value | Description | Required |
|--------|-------|-------------|----------|
| `--title` | `<title>` | Issue title | **Yes** |
| `--body` | `<body>` | Issue body/description | |
| `--labels` | `<labels>` | Comma-separated labels | |
| `--assignees` | `<assignees>` | Comma-separated assignees | |
| `--json` | | Output as JSON | |

**Example:**
```bash
fractary-core work issue-create --title "Bug: Login fails on mobile" --body "Steps to reproduce..." --labels "bug,priority:high" --assignees "alice,bob"
```

### `work issue-update`

Update a work item.

```bash
fractary-core work issue-update <number> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<number>` | Yes | Issue number |

| Option | Value | Description |
|--------|-------|-------------|
| `--title` | `<title>` | New title |
| `--body` | `<body>` | New body |
| `--state` | `<state>` | New state (`open`, `closed`) |
| `--json` | | Output as JSON |

### `work issue-close`

Close a work item.

```bash
fractary-core work issue-close <number> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<number>` | Yes | Issue number |

| Option | Value | Description |
|--------|-------|-------------|
| `--comment` | `<text>` | Add closing comment |
| `--json` | | Output as JSON |

### `work issue-reopen`

Reopen a closed work item.

```bash
fractary-core work issue-reopen <number> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<number>` | Yes | Issue number |

| Option | Value | Description |
|--------|-------|-------------|
| `--comment` | `<text>` | Add comment when reopening |
| `--json` | | Output as JSON |

### `work issue-assign`

Assign or unassign a work item.

```bash
fractary-core work issue-assign <number> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<number>` | Yes | Issue number |

| Option | Value | Description |
|--------|-------|-------------|
| `--user` | `<username>` | User to assign (use `@me` for self, omit to unassign) |
| `--json` | | Output as JSON |

### `work issue-classify`

Classify work item type (feature, bug, chore, patch).

```bash
fractary-core work issue-classify <number> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<number>` | Yes | Issue number |

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

### `work issue-search`

Search work items.

```bash
fractary-core work issue-search [options]
```

| Option | Value | Description | Default |
|--------|-------|-------------|---------|
| `--query` | `<query>` | Search query | **Required** |
| `--state` | `<state>` | Filter by state (`open`, `closed`, `all`) | `open` |
| `--labels` | `<labels>` | Filter by labels (comma-separated) | |
| `--limit` | `<n>` | Max results | `10` |
| `--json` | | Output as JSON | |

**Example:**
```bash
fractary-core work issue-search --query "authentication" --state open --labels "bug" --limit 20
```

### `work issue-comment`

Add a comment to a work item.

```bash
fractary-core work issue-comment <number> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<number>` | Yes | Issue number |

| Option | Value | Description | Required |
|--------|-------|-------------|----------|
| `--body` | `<text>` | Comment body | **Yes** |
| `--json` | | Output as JSON | |

### `work issue-comment-list`

List comments on a work item.

```bash
fractary-core work issue-comment-list <number> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<number>` | Yes | Issue number |

| Option | Value | Description |
|--------|-------|-------------|
| `--limit` | `<n>` | Max comments to show |
| `--json` | | Output as JSON |

### `work label-add`

Add labels to a work item.

```bash
fractary-core work label-add <number> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<number>` | Yes | Issue number |

| Option | Value | Description | Required |
|--------|-------|-------------|----------|
| `--labels` | `<labels>` | Comma-separated labels to add | **Yes** |
| `--json` | | Output as JSON | |

### `work label-remove`

Remove labels from a work item.

```bash
fractary-core work label-remove <number> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<number>` | Yes | Issue number |

| Option | Value | Description | Required |
|--------|-------|-------------|----------|
| `--labels` | `<labels>` | Comma-separated labels to remove | **Yes** |
| `--json` | | Output as JSON | |

### `work label-list`

List all available labels or labels on a specific issue.

```bash
fractary-core work label-list [options]
```

| Option | Value | Description |
|--------|-------|-------------|
| `--issue` | `<number>` | Show labels for a specific issue |
| `--json` | | Output as JSON |

### `work configure`

Configure work tracking settings.

```bash
fractary-core work configure [options]
```

| Option | Value | Description |
|--------|-------|-------------|
| `--platform` | `<name>` | Platform (`github`, `gitlab`, `bitbucket`, `jira`, `linear`) |
| `--project` | `<name>` | Project name (for Jira/Linear) |
| `--yes` | | Skip confirmation prompts |
| `--json` | | Output as JSON |

---

## Repo Commands

Repository and Git operations.

### `repo branch-create`

Create a new branch.

```bash
fractary-core repo branch-create <name> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<name>` | Yes | Branch name |

| Option | Value | Description |
|--------|-------|-------------|
| `--base` | `<branch>` | Base branch to create from |
| `--checkout` | | Checkout after creation |
| `--json` | | Output as JSON |

**Example:**
```bash
fractary-core repo branch-create feature/auth --base main --checkout
```

### `repo branch-delete`

Delete a branch.

```bash
fractary-core repo branch-delete <name> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<name>` | Yes | Branch name |

| Option | Value | Description | Default |
|--------|-------|-------------|---------|
| `--location` | `<where>` | Delete location: `local`\|`remote`\|`both` | `local` |
| `--force` | | Force delete even if not merged | |
| `--json` | | Output as JSON | |

### `repo branch-list`

List branches.

```bash
fractary-core repo branch-list [options]
```

| Option | Value | Description | Default |
|--------|-------|-------------|---------|
| `--merged` | | Show only merged branches | |
| `--stale` | | Show only stale branches | |
| `--pattern` | `<pattern>` | Filter by pattern | |
| `--limit` | `<n>` | Limit results | `20` |
| `--json` | | Output as JSON | |

### `repo commit`

Create a commit with conventional commit format.

```bash
fractary-core repo commit [options]
```

| Option | Value | Description | Required |
|--------|-------|-------------|----------|
| `--message` | `<msg>` | Commit message | **Yes** |
| `--type` | `<type>` | Commit type (`feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `build`) | |
| `--scope` | `<scope>` | Commit scope | |
| `--work-id` | `<id>` | Work item ID | |
| `--breaking` | | Mark as breaking change | |
| `--all` | | Stage all changes before committing | |
| `--json` | | Output as JSON | |

**Example:**
```bash
fractary-core repo commit --message "Add JWT authentication" --type feat --scope auth --work-id 123
fractary-core repo commit --message "Add JWT authentication" --type feat --all
```

### `repo pr-create`

Create a new pull request.

```bash
fractary-core repo pr-create [options]
```

| Option | Value | Description | Required |
|--------|-------|-------------|----------|
| `--title` | `<title>` | PR title | **Yes** |
| `--body` | `<body>` | PR body/description | |
| `--base` | `<branch>` | Base branch | main/master |
| `--head` | `<branch>` | Head branch | current branch |
| `--draft` | | Create as draft PR | |
| `--json` | | Output as JSON | |

**Example:**
```bash
fractary-core repo pr-create --title "Feature: JWT Auth" --body "Implements #123" --draft
```

### `repo pr-list`

List pull requests.

```bash
fractary-core repo pr-list [options]
```

| Option | Value | Description | Default |
|--------|-------|-------------|---------|
| `--state` | `<state>` | Filter by state (`open`, `closed`, `all`) | `open` |
| `--author` | `<username>` | Filter by author | |
| `--limit` | `<n>` | Limit results | `10` |
| `--json` | | Output as JSON | |

### `repo pr-merge`

Merge a pull request.

```bash
fractary-core repo pr-merge <number> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<number>` | Yes | PR number |

| Option | Value | Description | Default |
|--------|-------|-------------|---------|
| `--strategy` | `<strategy>` | Merge strategy (`merge`, `squash`, `rebase`) | `merge` |
| `--delete-branch` | | Delete branch after merge | |
| `--json` | | Output as JSON | |

### `repo pr-review`

Review a pull request.

```bash
fractary-core repo pr-review <number> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<number>` | Yes | PR number |

| Option | Value | Description |
|--------|-------|-------------|
| `--approve` | | Approve the PR |
| `--request-changes` | | Request changes |
| `--comment` | `<text>` | Add review comment |
| `--json` | | Output as JSON |

### `repo tag-create`

Create a new tag.

```bash
fractary-core repo tag-create <name> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<name>` | Yes | Tag name |

| Option | Value | Description |
|--------|-------|-------------|
| `--message` | `<msg>` | Tag message (creates annotated tag) |
| `--sign` | | Create a GPG-signed tag |
| `--force` | | Replace existing tag |
| `--json` | | Output as JSON |

### `repo tag-push`

Push tag(s) to remote.

```bash
fractary-core repo tag-push <name> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<name>` | Yes | Tag name or `all` for all tags |

| Option | Value | Description | Default |
|--------|-------|-------------|---------|
| `--remote` | `<name>` | Remote name | `origin` |
| `--json` | | Output as JSON | |

### `repo tag-list`

List tags.

```bash
fractary-core repo tag-list [options]
```

| Option | Value | Description |
|--------|-------|-------------|
| `--pattern` | `<pattern>` | Filter by pattern |
| `--latest` | `<n>` | Show only latest N tags |
| `--json` | | Output as JSON |

### `repo worktree-create`

Create a new worktree.

```bash
fractary-core repo worktree-create <branch> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<branch>` | Yes | Branch name |

| Option | Value | Description |
|--------|-------|-------------|
| `--path` | `<path>` | Worktree path |
| `--work-id` | `<id>` | Work item ID |
| `--base` | `<branch>` | Base branch to create from |
| `--no-checkout` | | Skip checking out files |
| `--json` | | Output as JSON |

### `repo worktree-list`

List worktrees.

```bash
fractary-core repo worktree-list [options]
```

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

### `repo worktree-remove`

Remove a worktree.

```bash
fractary-core repo worktree-remove <path> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<path>` | Yes | Worktree path |

| Option | Description |
|--------|-------------|
| `--force` | Force removal even with uncommitted changes |
| `--json` | Output as JSON |

### `repo worktree-cleanup`

Clean up stale worktrees.

```bash
fractary-core repo worktree-cleanup [options]
```

| Option | Description |
|--------|-------------|
| `--merged` | Remove only merged worktrees |
| `--stale` | Remove only stale worktrees |
| `--dry-run` | Show what would be removed without removing |
| `--json` | Output as JSON |

### `repo status`

Show repository status.

```bash
fractary-core repo status [options]
```

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

### `repo push`

Push commits to remote.

```bash
fractary-core repo push [options]
```

| Option | Value | Description | Default |
|--------|-------|-------------|---------|
| `--remote` | `<name>` | Remote name | `origin` |
| `--set-upstream` | | Set upstream branch | |
| `--force` | | Force push (use with caution) | |
| `--json` | | Output as JSON | |

### `repo pull`

Pull changes from remote.

```bash
fractary-core repo pull [options]
```

| Option | Value | Description | Default |
|--------|-------|-------------|---------|
| `--remote` | `<name>` | Remote name | `origin` |
| `--rebase` | | Rebase instead of merge | |
| `--json` | | Output as JSON | |

---

## Spec Commands

Technical specification management.

### `spec spec-create-file`

Create a new specification file.

```bash
fractary-core spec spec-create-file <title> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<title>` | Yes | Specification title |

| Option | Value | Description | Default |
|--------|-------|-------------|---------|
| `--template` | `<type>` | Template type (`feature`, `bugfix`, `refactor`) | `feature` |
| `--work-id` | `<id>` | Associated work item ID | |
| `--json` | | Output as JSON | |

**Example:**
```bash
fractary-core spec spec-create-file "API Authentication Design" --template feature --work-id 123
```

### `spec spec-get`

Get a specification by ID or path.

```bash
fractary-core spec spec-get <id> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Specification ID or path |

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

### `spec spec-list`

List specifications.

```bash
fractary-core spec spec-list [options]
```

| Option | Value | Description |
|--------|-------|-------------|
| `--status` | `<status>` | Filter by status (`draft`, `validated`, `needs_revision`) |
| `--work-id` | `<id>` | Filter by work item ID |
| `--json` | | Output as JSON |

### `spec spec-update`

Update a specification.

```bash
fractary-core spec spec-update <id> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Specification ID or path |

| Option | Value | Description |
|--------|-------|-------------|
| `--title` | `<title>` | New title |
| `--content` | `<content>` | New content |
| `--work-id` | `<id>` | Update work item ID |
| `--status` | `<status>` | Update status |
| `--json` | | Output as JSON |

### `spec spec-delete`

Delete a specification.

```bash
fractary-core spec spec-delete <id> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Specification ID or path |

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

### `spec spec-validate-check`

Run structural validation checks on a specification.

```bash
fractary-core spec spec-validate-check <id> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Specification ID or path |

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

### `spec spec-refine-scan`

Scan a specification for structural gaps and refinement areas.

```bash
fractary-core spec spec-refine-scan <id> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Specification ID or path |

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

### `spec spec-archive`

Archive specifications for a completed issue (copy to archive, verify, remove originals).

```bash
fractary-core spec spec-archive <issue_number> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<issue_number>` | Yes | GitHub issue number |

| Option | Description |
|--------|-------------|
| `--local` | Force local archive mode (skip cloud storage) |
| `--json` | Output as JSON |

### `spec template-list`

List available specification templates.

```bash
fractary-core spec template-list [options]
```

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

---

## Logs Commands

Log management with type classification and session capture.

### `logs types`

List available log types.

```bash
fractary-core logs types [options]
```

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

### `logs type-info`

Get log type definition.

```bash
fractary-core logs type-info <type> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<type>` | Yes | Log type ID |

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

### `logs validate`

Validate a log file against its type schema.

```bash
fractary-core logs validate <file> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<file>` | Yes | Path to log file |

| Option | Value | Description |
|--------|-------|-------------|
| `--log-type` | `<type>` | Override log type (auto-detected from frontmatter) |
| `--json` | | Output as JSON |

### `logs capture`

Start session capture for an issue.

```bash
fractary-core logs capture <issue_number> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<issue_number>` | Yes | Issue number to associate with session |

| Option | Value | Description |
|--------|-------|-------------|
| `--model` | `<model>` | Model being used |
| `--json` | | Output as JSON |

### `logs stop`

Stop active session capture.

```bash
fractary-core logs stop [options]
```

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

### `logs write`

Write a log entry.

```bash
fractary-core logs write [options]
```

| Option | Value | Description | Required |
|--------|-------|-------------|----------|
| `--type` | `<type>` | Log type (`session`, `build`, `deployment`, `test`, `debug`, `audit`, `operational`, `workflow`) | **Yes** |
| `--title` | `<title>` | Log title | **Yes** |
| `--content` | `<text>` | Log content | **Yes** |
| `--issue` | `<number>` | Associated issue number | |
| `--json` | | Output as JSON | |

**Example:**
```bash
fractary-core logs write --type session --title "Auth debugging session" --content "Investigated JWT expiry bug" --issue 123
```

### `logs read`

Read a log entry.

```bash
fractary-core logs read <id> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Log ID |

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

### `logs search`

Search logs.

```bash
fractary-core logs search [options]
```

| Option | Value | Description | Default |
|--------|-------|-------------|---------|
| `--query` | `<text>` | Search query | **Required** |
| `--type` | `<type>` | Filter by type | |
| `--issue` | `<number>` | Filter by issue number | |
| `--regex` | | Use regex for search | |
| `--limit` | `<n>` | Limit results | `10` |
| `--json` | | Output as JSON | |

### `logs list`

List logs.

```bash
fractary-core logs list [options]
```

| Option | Value | Description | Default |
|--------|-------|-------------|---------|
| `--type` | `<type>` | Filter by type | |
| `--status` | `<status>` | Filter by status | |
| `--issue` | `<number>` | Filter by issue number | |
| `--limit` | `<n>` | Limit results | `20` |
| `--json` | | Output as JSON | |

### `logs archive`

Archive old logs.

```bash
fractary-core logs archive [options]
```

| Option | Value | Description | Default |
|--------|-------|-------------|---------|
| `--max-age` | `<days>` | Archive logs older than N days | `90` |
| `--compress` | | Compress archived logs | |
| `--json` | | Output as JSON | |

### `logs delete`

Delete a log entry.

```bash
fractary-core logs delete <id> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Log ID |

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

---

## File Commands

File storage operations with multi-provider support (Local, S3, R2, GCS, Google Drive).

### `file upload`

Upload a local file to storage.

```bash
fractary-core file upload <local-path> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<local-path>` | Yes | Path to local file |

| Option | Value | Description |
|--------|-------|-------------|
| `--remote-path` | `<path>` | Remote storage path (defaults to filename) |
| `--source` | `<name>` | Named source from config |
| `--json` | | Output as JSON |

**Example:**
```bash
fractary-core file upload ./report.pdf --remote-path exports/report.pdf
fractary-core file upload ./data.csv --source my-s3-bucket
```

### `file download`

Download a file from storage to local path.

```bash
fractary-core file download <remote-path> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<remote-path>` | Yes | Remote storage path |

| Option | Value | Description |
|--------|-------|-------------|
| `--local-path` | `<path>` | Local destination path (defaults to filename) |
| `--source` | `<name>` | Named source from config |
| `--json` | | Output as JSON |

### `file write`

Write content to a storage path.

```bash
fractary-core file write <path> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<path>` | Yes | Storage path |

| Option | Value | Description | Required |
|--------|-------|-------------|----------|
| `--content` | `<text>` | Content to write | **Yes** |
| `--source` | `<name>` | Named source from config | |
| `--json` | | Output as JSON | |

### `file read`

Read content from a storage path.

```bash
fractary-core file read <path> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<path>` | Yes | Storage path |

| Option | Value | Description |
|--------|-------|-------------|
| `--source` | `<name>` | Named source from config |
| `--json` | | Output as JSON |

### `file list`

List files in storage.

```bash
fractary-core file list [options]
```

| Option | Value | Description |
|--------|-------|-------------|
| `--prefix` | `<prefix>` | Filter by prefix |
| `--source` | `<name>` | Named source from config |
| `--json` | | Output as JSON |

### `file delete`

Delete a file from storage.

```bash
fractary-core file delete <path> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<path>` | Yes | Storage path |

| Option | Value | Description |
|--------|-------|-------------|
| `--source` | `<name>` | Named source from config |
| `--json` | | Output as JSON |

### `file exists`

Check if a file exists in storage.

```bash
fractary-core file exists <path> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<path>` | Yes | Storage path |

| Option | Value | Description |
|--------|-------|-------------|
| `--source` | `<name>` | Named source from config |
| `--json` | | Output as JSON |

### `file copy`

Copy a file within storage.

```bash
fractary-core file copy <src-path> <dest-path> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<src-path>` | Yes | Source path |
| `<dest-path>` | Yes | Destination path |

| Option | Value | Description |
|--------|-------|-------------|
| `--source` | `<name>` | Named source from config |
| `--json` | | Output as JSON |

### `file move`

Move a file within storage.

```bash
fractary-core file move <src-path> <dest-path> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<src-path>` | Yes | Source path |
| `<dest-path>` | Yes | Destination path |

| Option | Value | Description |
|--------|-------|-------------|
| `--source` | `<name>` | Named source from config |
| `--json` | | Output as JSON |

### `file get-url`

Get a URL for a file in storage.

```bash
fractary-core file get-url <path> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<path>` | Yes | Storage path |

| Option | Value | Description |
|--------|-------|-------------|
| `--expires-in` | `<seconds>` | URL expiration in seconds |
| `--source` | `<name>` | Named source from config |
| `--json` | | Output as JSON |

### `file migrate-archive`

Migrate locally archived files to cloud storage.

```bash
fractary-core file migrate-archive [options]
```

| Option | Value | Description | Required |
|--------|-------|-------------|----------|
| `--local-dir` | `<path>` | Local archive directory (e.g., `.fractary/logs/archive`) | **Yes** |
| `--cloud-prefix` | `<prefix>` | Cloud storage prefix (e.g., `archive/logs`) | **Yes** |
| `--source` | `<name>` | Named source from config for cloud storage | **Yes** |
| `--dry-run` | | Show what would be migrated without doing it | |
| `--no-verify` | | Skip verification of cloud upload before deleting local | |
| `--json` | | Output as JSON | |

### `file show-config`

Show file plugin configuration.

```bash
fractary-core file show-config [options]
```

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

### `file test-connection`

Test storage connection.

```bash
fractary-core file test-connection [options]
```

| Option | Value | Description |
|--------|-------|-------------|
| `--source` | `<name>` | Named source to test |
| `--json` | | Output as JSON |

---

## Docs Commands

Documentation management with type system, archival, and validation.

### `docs doc-create`

Create a new document.

```bash
fractary-core docs doc-create <id> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Document ID |

| Option | Value | Description | Default | Required |
|--------|-------|-------------|---------|----------|
| `--title` | `<title>` | Document title | | **Yes** |
| `--content` | `<text>` | Document content | | **Yes** |
| `--format` | `<format>` | Format (`markdown`, `html`, `pdf`, `text`) | `markdown` | |
| `--doc-type` | `<type>` | Document type (`adr`, `api`, `architecture`, etc.) | | |
| `--tags` | `<tags>` | Comma-separated tags | | |
| `--category` | `<category>` | Document category | | |
| `--description` | `<desc>` | Document description | | |
| `--status` | `<status>` | Document status | | |
| `--json` | | Output as JSON | | |

**Example:**
```bash
fractary-core docs doc-create user-guide --title "User Guide" --content "# Getting Started..." --doc-type guides --tags "onboarding,getting-started"
```

### `docs doc-get`

Get a document.

```bash
fractary-core docs doc-get <id> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Document ID |

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

### `docs doc-list`

List documents.

```bash
fractary-core docs doc-list [options]
```

| Option | Value | Description |
|--------|-------|-------------|
| `--category` | `<category>` | Filter by category |
| `--tags` | `<tags>` | Filter by tags (comma-separated) |
| `--format` | `<format>` | Filter by format |
| `--json` | | Output as JSON |

### `docs doc-update`

Update a document.

```bash
fractary-core docs doc-update <id> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Document ID |

| Option | Value | Description | Required |
|--------|-------|-------------|----------|
| `--content` | `<text>` | New content | **Yes** |
| `--title` | `<title>` | New title | |
| `--tags` | `<tags>` | New tags (comma-separated) | |
| `--category` | `<category>` | New category | |
| `--description` | `<desc>` | New description | |
| `--json` | | Output as JSON | |

### `docs doc-delete`

Delete a document.

```bash
fractary-core docs doc-delete <id> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Document ID |

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

### `docs doc-search`

Search documents.

```bash
fractary-core docs doc-search [options]
```

| Option | Value | Description | Default |
|--------|-------|-------------|---------|
| `--text` | `<query>` | Search text in content and title | |
| `--tags` | `<tags>` | Filter by tags (comma-separated) | |
| `--author` | `<author>` | Filter by author | |
| `--category` | `<category>` | Filter by category | |
| `--doc-type` | `<type>` | Filter by document type | |
| `--limit` | `<n>` | Limit results | `10` |
| `--json` | | Output as JSON | |

### `docs doc-archive`

Archive a document using its type's configured archive source.

```bash
fractary-core docs doc-archive <id> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Document ID |

| Option | Value | Description |
|--------|-------|-------------|
| `--source` | `<name>` | Override archive source (default: from type config) |
| `--json` | | Output as JSON |

### `docs doc-refine-scan`

Scan a document for gaps and generate refinement questions.

```bash
fractary-core docs doc-refine-scan <id> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Document ID |

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

### `docs doc-validate-fulfillment`

Validate whether implementation fulfills the document's requirements.

```bash
fractary-core docs doc-validate-fulfillment <id> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Document ID |

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

### `docs type-list`

List available document types.

```bash
fractary-core docs type-list [options]
```

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

### `docs type-info`

Get detailed information about a document type.

```bash
fractary-core docs type-info <type> [options]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<type>` | Yes | Document type ID (e.g., `adr`, `api`, `architecture`) |

| Option | Description |
|--------|-------------|
| `--template` | Show the document template |
| `--standards` | Show the documentation standards |
| `--json` | Output as JSON |

---

## Environment Variables

The CLI loads environment variables from `.env` files automatically. You can also set them in your shell:

```bash
export GITHUB_TOKEN=ghp_your_token
export JIRA_TOKEN=your_jira_token
export LINEAR_API_KEY=lin_api_your_key
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
```

## Other Interfaces

- **SDK:** [API Reference](../sdk/js/README.md)
- **MCP:** [Tool Reference](../mcp/server/README.md)
- **Plugins:** [Plugin Reference](../plugins/README.md)
