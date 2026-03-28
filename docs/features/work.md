# Work Tracking

Work item and issue management across platforms. Create, fetch, update, search, and organize issues with comments, labels, and milestones.

## Contents

- [Platform Support](#platform-support)
- [Configuration](#configuration) - config.yaml reference, handler setup, environment variables
- [Issue Operations](#issue-operations) - create, fetch, update, search, close, assign, classify
- [Comment Operations](#comment-operations) - create and list comments
- [Label Operations](#label-operations) - add, remove, set, list labels
- [Milestone Operations](#milestone-operations) - create, list, assign milestones
- [Agents](#agents) - issue-refine-agent, issue-bulk-creator
- [Types & Schemas](#types--schemas) - TypeScript interfaces
- [Error Handling](#error-handling) - SDK errors, CLI exit codes, MCP error codes

---

## Platform Support

| Platform | Status | Handler Key |
|----------|--------|-------------|
| GitHub Issues | **Full support** | `github` |
| Jira Cloud | Stub (not yet functional) | `jira` |
| Linear | Stub (not yet functional) | `linear` |

## Configuration

The `work:` section of `.fractary/config.yaml` controls work tracking across all interfaces.

### Minimal Configuration

```yaml
work:
  active_handler: github
  handlers:
    github:
      owner: myorg
      repo: myrepo
      token: ${GITHUB_TOKEN}
```

### Full Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `active_handler` | string | Yes | Active platform: `github`, `jira`, or `linear` |
| `handlers` | object | Yes | At least one handler must be configured |
| `defaults` | object | No | Default values for operations |
| `hooks` | object | No | Webhook/integration hooks |
| `advanced` | object | No | Advanced configuration options |

### Handler: GitHub

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `owner` | string | Yes | - | GitHub organization or user |
| `repo` | string | Yes | - | Repository name |
| `token` | string | Yes | - | Personal access token (use `${GITHUB_TOKEN}`) |
| `api_url` | string | No | `https://api.github.com` | API endpoint (for GitHub Enterprise) |

```yaml
handlers:
  github:
    owner: myorg
    repo: myrepo
    token: ${GITHUB_TOKEN}
    api_url: https://api.github.com  # optional, for Enterprise
```

**Required token scopes:** `repo` (full repository access) for private repos, or `public_repo` for public repos only.

### Handler: Jira (Stub)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `base_url` | string | Yes | Jira instance URL (e.g., `https://myorg.atlassian.net`) |
| `email` | string | Yes | Email for authentication |
| `api_token` | string | Yes | Jira API token (use `${JIRA_API_TOKEN}`) |
| `project_key` | string | Yes | Jira project key (e.g., `PROJ`) |

```yaml
handlers:
  jira:
    base_url: ${JIRA_BASE_URL}
    email: ${JIRA_EMAIL}
    api_token: ${JIRA_API_TOKEN}
    project_key: PROJ
```

### Handler: Linear (Stub)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `api_key` | string | Yes | Linear API key (use `${LINEAR_API_KEY}`) |
| `team_key` | string | Yes | Team identifier |

```yaml
handlers:
  linear:
    api_key: ${LINEAR_API_KEY}
    team_key: TEAM
```

### Environment Variables

| Variable | Platform | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | GitHub | Personal access token |
| `JIRA_BASE_URL` | Jira | Instance URL |
| `JIRA_EMAIL` | Jira | Authentication email |
| `JIRA_API_TOKEN` | Jira | API token |
| `LINEAR_API_KEY` | Linear | API key |

---

## Issue Operations

### Quick Reference

| Operation | SDK | CLI | MCP | Plugin |
|-----------|-----|-----|-----|--------|
| [Create](#create-issue) | [`createIssue(opts)`](#create-issue-sdk) | [`issue-create`](#create-issue-cli) | [`issue_create`](#create-issue-mcp) | [`/issue-create`](#create-issue-plugin) |
| [Fetch](#fetch-issue) | [`fetchIssue(id)`](#fetch-issue-sdk) | [`issue-fetch`](#fetch-issue-cli) | [`issue_fetch`](#fetch-issue-mcp) | [`/issue-fetch`](#fetch-issue-plugin) |
| [Update](#update-issue) | [`updateIssue(id, opts)`](#update-issue-sdk) | [`issue-update`](#update-issue-cli) | [`issue_update`](#update-issue-mcp) | [`/issue-update`](#update-issue-plugin) |
| [List](#list-issues) | [`listIssues(filters)`](#list-issues-sdk) | [`issue-search`](#list-issues-cli) | [`issue_search`](#list-issues-mcp) | [`/issue-list`](#list-issues-plugin) |
| [Search](#search-issues) | [`searchIssues(q, f)`](#search-issues-sdk) | [`issue-search --query`](#search-issues-cli) | [`issue_search`](#search-issues-mcp) | [`/issue-search`](#search-issues-plugin) |
| [Close / Reopen](#close--reopen-issue) | [`closeIssue(id)`](#close--reopen-issue-sdk) | [`issue-close`](#close--reopen-issue-cli) | [`issue_close`](#close--reopen-issue-mcp) | via update |
| [Assign](#assign--unassign-issue) | [`assignIssue(id, u)`](#assign--unassign-issue-sdk) | [`issue-assign`](#assign--unassign-issue-cli) | [`issue_assign`](#assign--unassign-issue-mcp) | via update |
| [Classify](#classify-work-type) | [`classifyWorkType(issue)`](#classify-work-type-sdk) | [`issue-classify`](#classify-work-type-cli) | [`issue_classify`](#classify-work-type-mcp) | automatic |
| [Refine](#refine-issue) | - | - | - | [`/issue-refine`](#refine-issue-plugin) |
| [Bulk Create](#bulk-create-issues) | - | - | - | [`/issue-create-bulk`](#bulk-create-issues-plugin) |

> CLI commands are prefixed with `fractary-core` (e.g., `fractary-core work issue-create`).

---

### Create Issue

Create a new work item.

#### Create Issue: SDK

```typescript
const issue = await workManager.createIssue({
  title: 'Add user authentication',
  body: 'Implement JWT-based authentication',
  workType: 'feature',
  labels: ['enhancement', 'priority:high'],
  assignees: ['developer1'],
  milestone: 'v1.0.0'
});
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | Yes | Issue title |
| `body` | string | No | Issue description |
| `workType` | WorkType | No | Type of work (`feature`, `bug`, `chore`, etc.) |
| `labels` | string[] | No | Labels to apply |
| `assignees` | string[] | No | Users to assign |
| `milestone` | string | No | Milestone to assign |

**Returns:** `Promise<Issue>`

#### Create Issue: CLI

```bash
fractary-core work issue-create \
  --title "Add user authentication" \
  --body "Implement JWT-based authentication" \
  --labels "enhancement,priority:high" \
  --assignees "developer1"
```

| Flag | Required | Description |
|------|----------|-------------|
| `--title <title>` | Yes | Issue title |
| `--body <body>` | No | Issue description |
| `--labels <list>` | No | Comma-separated labels |
| `--assignees <list>` | No | Comma-separated assignees |
| `--repo <owner/repo>` | No | Override configured repo |
| `--update-existing` | No | Update if matching issue exists |
| `--match-labels <labels>` | No | Match existing issues by labels |
| `--match-title <title>` | No | Match existing issues by title |
| `--exclude-labels <labels>` | No | Exclude issues with these labels |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional context |

#### Create Issue: MCP

Tool: `fractary_work_issue_create`

```json
{
  "title": "Add user authentication",
  "body": "Implement JWT-based authentication",
  "type": "feature",
  "labels": ["enhancement", "priority:high"],
  "assignee": "developer1"
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | Yes | Issue title |
| `body` | string | No | Issue description |
| `type` | string | No | Work type: `feature`, `bug`, `chore`, `task` |
| `labels` | string[] | No | Labels to apply |
| `assignee` | string | No | User to assign |
| `milestone` | string | No | Milestone to associate |

#### Create Issue: Plugin

Command: `/fractary-work-issue-create`

| Argument | Required | Description |
|----------|----------|-------------|
| `--title <title>` | Yes | Issue title |
| `--body <text>` | No | Issue description |
| `--labels <label1,label2>` | No | Comma-separated labels |
| `--assignees <users>` | No | Comma-separated assignees |
| `--repo <owner/repo>` | No | Override configured repo |
| `--update-existing` | No | Update if matching issue exists |
| `--match-labels <labels>` | No | Match existing issues by labels |
| `--match-title <title>` | No | Match existing issues by title |
| `--exclude-labels <labels>` | No | Exclude issues with these labels |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI (`fractary-core work issue-create`). No agent delegation.

---

### Fetch Issue

Retrieve an issue by number.

#### Fetch Issue: SDK

```typescript
const issue = await workManager.fetchIssue(123);
console.log(issue.title, issue.state);
```

**Returns:** `Promise<Issue>`

#### Fetch Issue: CLI

```bash
fractary-core work issue-fetch 123
fractary-core work issue-fetch 123 --verbose --json
```

| Flag | Description |
|------|-------------|
| `--verbose` | Show additional details (labels, assignees) |
| `--json` | Output as JSON |
| `--context <text>` | Additional context |

#### Fetch Issue: MCP

Tool: `fractary_work_issue_fetch`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issue_number` | string | Yes | Issue number or ID |

#### Fetch Issue: Plugin

Command: `/fractary-work-issue-fetch`

| Argument | Required | Description |
|----------|----------|-------------|
| `<number>` | Yes | Issue number |
| `--verbose` | No | Show additional details |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI (`fractary-core work issue-fetch`). No agent delegation.

---

### Update Issue

Update an existing issue's title, body, or state.

#### Update Issue: SDK

```typescript
const updated = await workManager.updateIssue(123, {
  title: 'Updated title',
  state: 'closed'
});
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | No | New title |
| `body` | string | No | New description |
| `state` | `'open'` \| `'closed'` | No | New state |

**Returns:** `Promise<Issue>`

#### Update Issue: CLI

```bash
fractary-core work issue-update 123 --title "Updated title"
fractary-core work issue-update 123 --state closed
```

| Flag | Description |
|------|-------------|
| `--title <title>` | New title |
| `--body <body>` | New body |
| `--state <state>` | `open` or `closed` |
| `--json` | Output as JSON |
| `--context <text>` | Additional context |

#### Update Issue: MCP

Tool: `fractary_work_issue_update`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issue_number` | string | Yes | Issue number or ID |
| `title` | string | No | New title |
| `body` | string | No | New description |
| `state` | string | No | `open` or `closed` |

#### Update Issue: Plugin

Command: `/fractary-work-issue-update`

| Argument | Required | Description |
|----------|----------|-------------|
| `<number>` | Yes | Issue number |
| `--title <title>` | No | New title |
| `--body <text>` | No | New body |
| `--state <state>` | No | `open` or `closed` |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI (`fractary-core work issue-update`). No agent delegation.

---

### List Issues

List issues with optional filters.

#### List Issues: SDK

```typescript
const issues = await workManager.listIssues({
  state: 'open',
  labels: ['bug']
});
```

#### List Issues: CLI

```bash
fractary-core work issue-search --state open --labels "bug" --limit 20
```

> Note: The CLI uses `issue-search` for both listing and searching. Omit `--query` to list.

#### List Issues: MCP

Tool: `fractary_work_issue_search` (omit `query` parameter to list)

#### List Issues: Plugin

Command: `/fractary-work-issue-list`

| Argument | Required | Description |
|----------|----------|-------------|
| `--state <state>` | No | `open`, `closed`, or `all` |
| `--labels <labels>` | No | Comma-separated label filter |
| `--limit <n>` | No | Max results |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI (`fractary-core work issue-search`). No agent delegation.

---

### Search Issues

Search issues by query text with optional filters.

#### Search Issues: SDK

```typescript
const issues = await workManager.searchIssues('authentication', {
  state: 'open',
  labels: ['enhancement']
});
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query |
| `filters.state` | string | No | `open`, `closed`, or `all` |
| `filters.labels` | string[] | No | Label filter |
| `filters.assignee` | string | No | Assignee filter |

**Returns:** `Promise<Issue[]>`

#### Search Issues: CLI

```bash
fractary-core work issue-search --query "authentication"
fractary-core work issue-search --query "login" --state closed --labels "bug"
fractary-core work issue-search --query "API" --limit 5 --json
```

| Flag | Description |
|------|-------------|
| `--query <query>` | Search query (required for search) |
| `--state <state>` | `open`, `closed`, or `all` (default: `open`) |
| `--labels <list>` | Comma-separated label filter |
| `--limit <n>` | Max results (default: 10) |
| `--json` | Output as JSON |
| `--context <text>` | Additional context |

#### Search Issues: MCP

Tool: `fractary_work_issue_search`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | No | Search query |
| `state` | string | No | `open`, `closed`, or `all` |
| `labels` | string[] | No | Label filter |
| `assignee` | string | No | Assignee filter |
| `milestone` | string | No | Milestone filter |
| `since` | string | No | Created after date (ISO 8601) |

#### Search Issues: Plugin

Command: `/fractary-work-issue-search`

| Argument | Required | Description |
|----------|----------|-------------|
| `--query <query>` | Yes | Search query |
| `--state <state>` | No | `open`, `closed`, or `all` |
| `--labels <labels>` | No | Comma-separated label filter |
| `--limit <n>` | No | Max results |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI (`fractary-core work issue-search`). No agent delegation.

---

### Close / Reopen Issue

#### Close / Reopen Issue: SDK

```typescript
await workManager.closeIssue(123);
await workManager.reopenIssue(123);
```

#### Close / Reopen Issue: CLI

```bash
fractary-core work issue-close 123
fractary-core work issue-close 123 --comment "Fixed in PR #456"
fractary-core work issue-reopen 123
fractary-core work issue-reopen 123 --comment "Regression found, reopening"
```

| Flag | Description |
|------|-------------|
| `--comment <text>` | Add a comment when closing/reopening |
| `--json` | Output as JSON |

#### Close / Reopen Issue: MCP

Tools: `fractary_work_issue_close` / `fractary_work_issue_reopen`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issue_number` | string | Yes | Issue number or ID |
| `comment` | string | No | Optional comment |

---

### Assign / Unassign Issue

#### Assign / Unassign Issue: SDK

```typescript
await workManager.assignIssue(123, 'developer1');
await workManager.unassignIssue(123);
```

#### Assign / Unassign Issue: CLI

```bash
fractary-core work issue-assign 123 --user developer1
fractary-core work issue-assign 123 --user @me    # assign to self
fractary-core work issue-assign 123               # unassign
```

#### Assign / Unassign Issue: MCP

Tools: `fractary_work_issue_assign` / `fractary_work_issue_unassign`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issue_number` | string | Yes | Issue number or ID |
| `assignee` | string | Yes (assign only) | Username to assign to |

---

### Classify Work Type

Classify an issue as feature, bug, chore, patch, infrastructure, or api based on its content.

#### Classify Work Type: SDK

```typescript
const result = workManager.classifyWorkType(issue);
// { work_type: 'feature', confidence: 0.92, signals: {...} }
```

**Returns:** `ClassifyResult`

#### Classify Work Type: CLI

```bash
fractary-core work issue-classify 123
# Output: feature (confidence: 92%)

fractary-core work issue-classify 123 --json
```

#### Classify Work Type: MCP

Tool: `fractary_work_issue_classify`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issue_number` | string | Yes | Issue number or ID |

**Response:**
```json
{ "success": true, "data": { "issue_number": "123", "classification": "feature", "confidence": 0.92 } }
```

---

### Refine Issue

Review an issue and ask clarifying questions to improve requirement clarity. Focuses on **what** (requirements, goals, scope, acceptance criteria), not how (implementation).

#### Refine Issue: Plugin

Command: `/fractary-work-issue-refine`

| Argument | Required | Description |
|----------|----------|-------------|
| `<number>` | Yes | Issue number to refine |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Delegates to **`fractary-work-issue-refine-agent`**. The agent reads the issue, identifies gaps in the requirements, and asks targeted clarifying questions through an interactive conversation.

**Agent triggers:** Also activates proactively when you say "refine this issue", "clarify requirements", or similar phrases.

> This operation is plugin-only. The interactive Q&A nature requires an AI agent and is not available through SDK, CLI, or MCP.

---

### Bulk Create Issues

Analyze project structure and conversation context to intelligently create multiple related issues at once.

#### Bulk Create Issues: Plugin

Command: `/fractary-work-issue-create-bulk`

| Argument | Required | Description |
|----------|----------|-------------|
| `--title <template>` | No | Title template for generated issues |
| `--body <template>` | No | Body template for generated issues |
| `--repo <owner/repo>` | No | Override configured repo |
| `--context <description>` | No | Description of what issues to create |
| `--type <type>` | No | Work type for all issues |
| `--label <label>` | No | Label to apply to all issues |
| `--template <name>` | No | Issue template name |
| `--assignee <user>` | No | Assignee for all issues |
| `--update-existing` | No | Update matching issues instead of creating duplicates |
| `--match-labels <labels>` | No | Match existing issues by labels |
| `--exclude-labels <labels>` | No | Skip issues with these labels |

**Delegation:** Delegates to **`fractary-work-issue-bulk-creator`** agent. The agent:
1. Analyzes project structure and conversation context
2. Determines what issues to create (datasets, API endpoints, templates, etc.)
3. Presents a plan for your approval
4. Creates all issues after confirmation
5. Returns a summary with issue URLs

**Agent triggers:** Also activates proactively when you say "create multiple issues", "break this down into issues", or similar phrases.

> This operation is plugin-only. The AI analysis and interactive confirmation require an agent and are not available through SDK, CLI, or MCP.

---

## Comment Operations

### Quick Reference

| Operation | SDK | CLI | MCP | Plugin |
|-----------|-----|-----|-----|--------|
| [Create](#create-comment) | [`createComment(id, body)`](#create-comment-sdk) | [`issue-comment`](#create-comment-cli) | [`comment_create`](#create-comment-mcp) | [`/issue-comment`](#create-comment-plugin) |
| [List](#list-comments) | [`listComments(id)`](#list-comments-sdk) | [`issue-comment-list`](#list-comments-cli) | [`comment_list`](#list-comments-mcp) | - |

---

### Create Comment

Add a comment to an issue.

#### Create Comment: SDK

```typescript
const comment = await workManager.createComment(123, 'Investigation complete');
```

The SDK also accepts an optional `faberContext` parameter (`frame`, `architect`, `build`, `evaluate`, `release`) for FABER workflow integration.

**Returns:** `Promise<Comment>`

#### Create Comment: CLI

```bash
fractary-core work issue-comment 123 --body "Investigation complete"
```

| Flag | Required | Description |
|------|----------|-------------|
| `--body <text>` | Yes | Comment text |
| `--json` | No | Output as JSON |

#### Create Comment: MCP

Tool: `fractary_work_comment_create`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issue_number` | string | Yes | Issue number or ID |
| `body` | string | Yes | Comment text |
| `faber_context` | string | No | FABER phase: `frame`, `architect`, `build`, `evaluate`, `release` |

#### Create Comment: Plugin

Command: `/fractary-work-issue-comment`

| Argument | Required | Description |
|----------|----------|-------------|
| `<number>` | Yes | Issue number |
| `--body <text>` | Yes | Comment text |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI (`fractary-core work issue-comment`). No agent delegation.

---

### List Comments

List comments on an issue.

#### List Comments: SDK

```typescript
const comments = await workManager.listComments(123);
```

**Returns:** `Promise<Comment[]>`

#### List Comments: CLI

```bash
fractary-core work issue-comment-list 123
fractary-core work issue-comment-list 123 --limit 5
```

| Flag | Description |
|------|-------------|
| `--limit <n>` | Max comments to show |
| `--json` | Output as JSON |

#### List Comments: MCP

Tool: `fractary_work_comment_list`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issue_number` | string | Yes | Issue number or ID |
| `limit` | number | No | Maximum comments |
| `since` | string | No | Only comments after this date (ISO 8601) |

---

## Label Operations

### Quick Reference

| Operation | SDK | CLI | MCP | Plugin |
|-----------|-----|-----|-----|--------|
| [Add](#label-add) | [`addLabels(id, labels)`](#label-add-sdk) | [`label-add`](#label-add-cli) | [`label_add`](#label-add-mcp) | - |
| [Remove](#label-remove) | [`removeLabels(id, labels)`](#label-remove-sdk) | [`label-remove`](#label-remove-cli) | [`label_remove`](#label-remove-mcp) | - |
| [Set (replace all)](#label-set) | [`setLabels(id, labels)`](#label-set-sdk) | - | [`label_set`](#label-set-mcp) | - |
| [List](#label-list) | [`listLabels(id?)`](#label-list-sdk) | [`label-list`](#label-list-cli) | [`label_list`](#label-list-mcp) | - |

---

### Label Add

Add labels to an issue.

#### Label Add: SDK

```typescript
await workManager.addLabels(123, ['bug', 'priority:high']);
```

#### Label Add: CLI

```bash
fractary-core work label-add 123 --labels "bug,priority:high"
```

#### Label Add: MCP

Tool: `fractary_work_label_add` with `{ "issue_number": "123", "labels": ["bug", "priority:high"] }`

---

### Label Remove

Remove labels from an issue.

#### Label Remove: SDK

```typescript
await workManager.removeLabels(123, ['wontfix']);
```

#### Label Remove: CLI

```bash
fractary-core work label-remove 123 --labels "wontfix"
```

#### Label Remove: MCP

Tool: `fractary_work_label_remove` with `{ "issue_number": "123", "labels": ["wontfix"] }`

---

### Label Set

Replace all labels on an issue.

#### Label Set: SDK

```typescript
await workManager.setLabels(123, ['enhancement', 'in-progress']);
```

#### Label Set: MCP

Tool: `fractary_work_label_set` with `{ "issue_number": "123", "labels": ["enhancement", "v2"] }`

> Not available via CLI. Use `label-add` and `label-remove` to manage labels incrementally.

---

### Label List

List labels on an issue or all repository labels.

#### Label List: SDK

```typescript
const issueLabels = await workManager.listLabels(123);  // issue labels
const allLabels = await workManager.listLabels();        // all repo labels
```

#### Label List: CLI

```bash
fractary-core work label-list              # all repo labels
fractary-core work label-list --issue 123  # issue labels
```

#### Label List: MCP

Tool: `fractary_work_label_list`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issue_number` | string | No | List labels for specific issue. Omit for all repo labels. |

---

## Milestone Operations

### Quick Reference

| Operation | SDK | CLI | MCP | Plugin |
|-----------|-----|-----|-----|--------|
| [Create](#milestone-create) | [`createMilestone(opts)`](#milestone-create-sdk) | - | [`milestone_create`](#milestone-create-mcp) | - |
| [List](#milestone-list) | [`listMilestones(state?)`](#milestone-list-sdk) | - | [`milestone_list`](#milestone-list-mcp) | - |
| [Set on issue](#milestone-set) | [`setMilestone(id, name)`](#milestone-set-sdk) | - | [`milestone_set`](#milestone-set-mcp) | - |
| [Remove from issue](#milestone-remove) | [`removeMilestone(id)`](#milestone-remove-sdk) | - | [`milestone_remove`](#milestone-remove-mcp) | - |

> Milestone operations are currently available through SDK and MCP only. CLI support is planned.

---

### Milestone Create

#### Milestone Create: SDK

```typescript
const milestone = await workManager.createMilestone({
  title: 'v1.0.0',
  description: 'Initial release',
  dueDate: '2024-03-01'
});
```

#### Milestone Create: MCP

Tool: `fractary_work_milestone_create`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | Yes | Milestone title |
| `description` | string | No | Milestone description |
| `due_on` | string | No | Due date (ISO 8601) |

---

### Milestone List

#### Milestone List: SDK

```typescript
const milestones = await workManager.listMilestones('open');
```

#### Milestone List: MCP

Tool: `fractary_work_milestone_list` with optional `{ "state": "open" }`

---

### Milestone Set

Set a milestone on an issue.

#### Milestone Set: SDK

```typescript
await workManager.setMilestone(123, 'v1.0.0');
```

#### Milestone Set: MCP

Tool: `fractary_work_milestone_set` with `{ "issue_number": "123", "milestone": "v1.0.0" }`

---

### Milestone Remove

Remove a milestone from an issue.

#### Milestone Remove: SDK

```typescript
await workManager.removeMilestone(123);
```

#### Milestone Remove: MCP

Tool: `fractary_work_milestone_remove` with `{ "issue_number": "123" }`

---

## Agents

These agents are available in the Claude Code plugin and can be triggered proactively based on conversation context.

### issue-refine-agent

Reviews issues and asks clarifying questions about **what** (requirements, goals, scope, acceptance criteria), not how (implementation). Part of the "frame phase" before architectural planning.

**Invoked by:** `/fractary-work-issue-refine` command

**Triggers proactively:** "refine this issue", "clarify requirements"

**Tools available:** Full tool access for reading issues, posting comments, and gathering context.

### issue-bulk-creator

Analyzes project structure and conversation context to determine what issues to create. Presents a plan for confirmation before creating anything. Useful for breaking epics into individual issues.

**Invoked by:** `/fractary-work-issue-create-bulk` command

**Triggers proactively:** "create multiple issues", "break this down into issues"

**Tools available:** Full tool access for analyzing code, reading issues, and creating new issues.

---

## Types & Schemas

```typescript
interface Issue {
  id: string;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  labels: Label[];
  assignees: string[];
  milestone?: Milestone;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  url: string;
}

type WorkType = 'feature' | 'bug' | 'chore' | 'patch' | 'infrastructure' | 'api';

interface ClassifyResult {
  work_type: WorkType;
  confidence: number;    // 0 to 1
  signals: ClassifySignals;
}

interface Label {
  name: string;
  color: string;
  description?: string;
}

interface Milestone {
  id: string;
  title: string;
  description?: string;
  state: 'open' | 'closed';
  dueDate?: string;
}

interface Comment {
  id: string;
  body: string;
  author: string;
  created_at: string;
  updated_at: string;
}
```

---

## Error Handling

### SDK Errors

```typescript
import { WorkError } from '@fractary/core';

try {
  const issue = await workManager.fetchIssue(999);
} catch (error) {
  if (error instanceof WorkError) {
    console.error('Work tracking error:', error.message);
  }
}
```

Error types: `IssueNotFoundError`, `IssueCreateError`, `LabelError`, `MilestoneError`

### CLI Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | General error |
| `3` | Resource not found / validation failure |

All CLI commands support `--json` for structured error output:
```json
{ "status": "error", "error": { "code": "NOT_FOUND", "message": "Issue #999 not found" } }
```

### MCP Error Codes

| Code | Description |
|------|-------------|
| `NOT_FOUND` | Issue or resource not found |
| `UNAUTHORIZED` | Authentication failed |
| `FORBIDDEN` | Insufficient permissions |
| `VALIDATION_ERROR` | Invalid parameters |
| `RATE_LIMITED` | API rate limit exceeded |
