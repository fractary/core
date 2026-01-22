# Work Toolset - CLI Reference

Command-line reference for the Work toolset. Work tracking across GitHub Issues, Jira, and Linear.

## Command Structure

```bash
fractary-core work <resource> <action> [options]
```

## Issue Commands

### work issue fetch

Fetch an issue by number or ID.

```bash
fractary-core work issue fetch <issue-id> [options]
```

**Arguments:**
- `issue-id` - Issue number or ID

**Options:**
- `--format <type>` - Output format: `json`, `table`, `text`

**Examples:**
```bash
# Fetch issue #123
fractary-core work issue fetch 123

# Output as JSON
fractary-core work issue fetch 123 --format json
```

### work issue create

Create a new issue.

```bash
fractary-core work issue create <title> [options]
```

**Arguments:**
- `title` - Issue title

**Options:**
- `--body <text>` - Issue description
- `--type <type>` - Work type: `feature`, `bug`, `chore`, `patch`, `infrastructure`, `api`
- `--labels <labels>` - Comma-separated labels
- `--assignees <users>` - Comma-separated usernames
- `--milestone <name>` - Milestone name

**Examples:**
```bash
# Create a bug report
fractary-core work issue create "Login fails on mobile" \
  --type bug \
  --labels "bug,priority:high" \
  --assignees "developer1"

# Create a feature request
fractary-core work issue create "Add dark mode" \
  --type feature \
  --body "Implement dark mode toggle in settings"
```

### work issue update

Update an existing issue.

```bash
fractary-core work issue update <issue-id> [options]
```

**Arguments:**
- `issue-id` - Issue number or ID

**Options:**
- `--title <text>` - New title
- `--body <text>` - New description
- `--state <state>` - State: `open`, `closed`

**Examples:**
```bash
# Close an issue
fractary-core work issue update 123 --state closed

# Update title
fractary-core work issue update 123 --title "Updated title"
```

### work issue list

List issues.

```bash
fractary-core work issue list [options]
```

**Options:**
- `--state <state>` - Filter by state: `open`, `closed`, `all`
- `--labels <labels>` - Filter by labels (comma-separated)
- `--assignee <user>` - Filter by assignee
- `--limit <n>` - Maximum results
- `--format <type>` - Output format

**Examples:**
```bash
# List open issues
fractary-core work issue list --state open

# List bugs assigned to me
fractary-core work issue list --labels bug --assignee @me
```

### work issue search

Search issues.

```bash
fractary-core work issue search <query> [options]
```

**Arguments:**
- `query` - Search query

**Options:**
- `--state <state>` - Filter by state
- `--labels <labels>` - Filter by labels

**Examples:**
```bash
# Search for authentication issues
fractary-core work issue search "authentication" --state open
```

## Comment Commands

### work comment add

Add a comment to an issue.

```bash
fractary-core work comment add <issue-id> <body> [options]
```

**Arguments:**
- `issue-id` - Issue number or ID
- `body` - Comment text

**Options:**
- `--faber-context <phase>` - FABER phase: `frame`, `architect`, `build`, `evaluate`, `release`

**Examples:**
```bash
# Add a comment
fractary-core work comment add 123 "Investigation complete, root cause identified"

# Add comment with FABER context
fractary-core work comment add 123 "Starting implementation" --faber-context build
```

### work comment list

List comments on an issue.

```bash
fractary-core work comment list <issue-id> [options]
```

**Arguments:**
- `issue-id` - Issue number or ID

**Options:**
- `--limit <n>` - Maximum results
- `--format <type>` - Output format

## Label Commands

### work label add

Add labels to an issue.

```bash
fractary-core work label add <issue-id> <labels>
```

**Arguments:**
- `issue-id` - Issue number or ID
- `labels` - Comma-separated labels

**Example:**
```bash
fractary-core work label add 123 "bug,priority:high"
```

### work label remove

Remove labels from an issue.

```bash
fractary-core work label remove <issue-id> <labels>
```

### work label set

Replace all labels on an issue.

```bash
fractary-core work label set <issue-id> <labels>
```

### work label list

List labels.

```bash
fractary-core work label list [issue-id]
```

**Arguments:**
- `issue-id` (optional) - Issue number to list labels for; if omitted, lists all repo labels

## Milestone Commands

### work milestone create

Create a milestone.

```bash
fractary-core work milestone create <title> [options]
```

**Arguments:**
- `title` - Milestone title

**Options:**
- `--description <text>` - Milestone description
- `--due <date>` - Due date (YYYY-MM-DD)

### work milestone list

List milestones.

```bash
fractary-core work milestone list [options]
```

**Options:**
- `--state <state>` - Filter by state: `open`, `closed`, `all`

### work milestone set

Set milestone on an issue.

```bash
fractary-core work milestone set <issue-id> <milestone>
```

### work milestone remove

Remove milestone from an issue.

```bash
fractary-core work milestone remove <issue-id>
```

## Output Examples

### JSON Output

```bash
fractary-core work issue fetch 123 --format json
```

```json
{
  "number": 123,
  "title": "Bug: Login fails on mobile",
  "state": "open",
  "labels": ["bug", "priority:high"],
  "assignees": ["developer1"],
  "url": "https://github.com/myorg/myrepo/issues/123"
}
```

### Table Output

```bash
fractary-core work issue list --format table
```

```
NUMBER  TITLE                           STATE   LABELS
123     Bug: Login fails on mobile      open    bug, priority:high
124     Add dark mode                   open    enhancement
125     Update dependencies             closed  chore
```

## Environment Variables

```bash
# Provider selection
export FRACTARY_WORK_PROVIDER=github

# GitHub credentials
export GITHUB_TOKEN=ghp_your_token
export GITHUB_OWNER=myorg
export GITHUB_REPO=myrepo

# Jira credentials
export JIRA_HOST=https://myorg.atlassian.net
export JIRA_EMAIL=user@example.com
export JIRA_TOKEN=your_jira_token

# Linear credentials
export LINEAR_API_KEY=lin_api_your_key
```

## Other Interfaces

- **SDK:** [Work API](/docs/sdk/work.md)
- **MCP:** [Work Tools](/docs/mcp/work.md)
- **Plugin:** [Work Plugin](/docs/plugins/work.md)
- **Configuration:** [Work Config](/docs/configuration/README.md#work)
