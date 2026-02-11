# Fractary Plugins for Claude Code

Claude Code plugins providing commands, agents, and skills for software development workflows.

## What are Fractary Plugins?

Fractary plugins extend Claude Code with specialized capabilities. Each plugin maps to a toolset and provides:

- **Commands** - Slash commands invoked with `/plugin-name:command`
- **Agents** - Autonomous task handlers for complex, multi-step operations
- **Skills** - Internal capabilities used by agents (not directly user-invocable)

## Available Plugins

| Plugin | Version | Commands | Agents | Description |
|--------|---------|----------|--------|-------------|
| [`fractary-core`](#fractary-core) | 3.5.5 | 7 | 3 | Configuration and environment management |
| [`fractary-work`](#fractary-work) | 3.0.16 | 8 | 2 | Work item and issue tracking |
| [`fractary-repo`](#fractary-repo) | 3.0.15 | 13 | 1 | Repository and Git operations |
| [`fractary-spec`](#fractary-spec) | 2.0.19 | 9 | 9 | Specification management |
| [`fractary-logs`](#fractary-logs) | 4.1.4 | 15 | 4 | Log management |
| [`fractary-file`](#fractary-file) | 3.0.4 | 13 | 5 | Multi-provider file storage |
| [`fractary-docs`](#fractary-docs) | 4.0.7 | 14 | 6 | Documentation management |
| [`fractary-status`](#fractary-status) | 1.1.15 | 2 | 2 | Status line for Claude Code |

**Totals: 81 commands, 32 agents across 8 plugins**

## Installation

Plugins are installed via `.claude/settings.json`. The exact installation method depends on your Claude Code setup - typically plugins are added as npm packages or local paths.

### Configuration

All plugins read configuration from `.fractary/config.yaml`. Initialize with:

```
/fractary-core:config-init
```

---

## fractary-core

Configuration and environment management for all Fractary plugins.

### Commands

| Command | Description |
|---------|-------------|
| `/fractary-core:config-init` | Initialize `.fractary/config.yaml` for all plugins |
| `/fractary-core:config-update` | Update existing configuration incrementally |
| `/fractary-core:config-validate` | Validate configuration |
| `/fractary-core:config-show` | Display configuration (sensitive values redacted) |
| `/fractary-core:env-switch` | Switch environment (test, staging, prod) |
| `/fractary-core:env-list` | List available environments |
| `/fractary-core:env-show` | Show current environment status |

### Agents

| Agent | Trigger | Description |
|-------|---------|-------------|
| `config-initializer` | "setup fractary", "initialize project", "configure plugins" | Fresh setup of `.fractary/config.yaml` with smart auto-detection of platforms and project info |
| `config-updater` | "change config", "update config", "switch to jira", "enable S3" | Incrementally updates config based on natural language instructions |
| `env-switcher` | "switch to prod", "use test environment" | Switches active environment by loading environment-specific `.env` files |

---

## fractary-work

Work item management. Currently supports GitHub Issues (Jira and Linear providers are planned).

### Commands

| Command | Description |
|---------|-------------|
| `/fractary-work:issue-create` | Create a new issue |
| `/fractary-work:issue-fetch` | Fetch issue details by number |
| `/fractary-work:issue-list` | List issues |
| `/fractary-work:issue-update` | Update an existing issue |
| `/fractary-work:issue-search` | Search issues by query |
| `/fractary-work:issue-comment` | Post a comment on an issue |
| `/fractary-work:issue-create-bulk` | Create multiple related issues at once using AI analysis |
| `/fractary-work:issue-refine` | Refine issue requirements through clarifying questions |

### Agents

| Agent | Trigger | Description |
|-------|---------|-------------|
| `issue-refine-agent` | "refine this issue", "clarify requirements" | Reviews issues and asks clarifying questions about WHAT (requirements, goals, scope, acceptance criteria), not HOW (implementation). Part of the "frame phase" before planning. |
| `issue-bulk-creator` | "create multiple issues", "break this down into issues" | Analyzes project structure and conversation context to determine what issues to create. Presents a plan for confirmation before creating anything. |

### Usage Examples

```
User: Create an issue for adding OAuth support
Claude: /fractary-work:issue-create

User: This issue is too vague, help me refine it
Claude: [Uses issue-refine-agent to ask targeted questions about requirements]

User: Break this epic into individual issues
Claude: /fractary-work:issue-create-bulk
```

---

## fractary-repo

Source control operations. Currently supports GitHub (GitLab and Bitbucket providers are planned).

### Commands

| Command | Description |
|---------|-------------|
| `/fractary-repo:branch-create` | Create a new git branch |
| `/fractary-repo:commit` | Create a git commit with conventional format |
| `/fractary-repo:commit-push` | Commit and push in one step |
| `/fractary-repo:commit-push-pr` | Commit, push, and open a PR |
| `/fractary-repo:commit-push-pr-merge` | Full workflow: commit, push, create PR, merge, cleanup branch |
| `/fractary-repo:pr-create` | Create a pull request |
| `/fractary-repo:pr-merge` | Merge a pull request |
| `/fractary-repo:pr-review` | Review a pull request (delegates to pr-review-agent) |
| `/fractary-repo:pull` | Pull from remote |
| `/fractary-repo:worktree-create` | Create a git worktree |
| `/fractary-repo:worktree-list` | List all worktrees with metadata |
| `/fractary-repo:worktree-remove` | Safely remove a worktree |
| `/fractary-repo:worktree-cleanup` | Clean up stale and orphaned worktrees |

### Agents

| Agent | Trigger | Description |
|-------|---------|-------------|
| `pr-review-agent` | "review this PR", "analyze PR #123" | Comprehensively analyzes PRs including comments, reviews, CI status, and merge conflicts. Provides intelligent recommendations on whether to approve. |

### Usage Examples

```
User: Commit my changes and create a PR
Claude: /fractary-repo:commit-push-pr

User: Review PR #42
Claude: [Uses pr-review-agent for comprehensive analysis]

User: Ship it - commit, PR, and merge
Claude: /fractary-repo:commit-push-pr-merge
```

---

## fractary-spec

Ephemeral specification management tied to work items with lifecycle-based archival. Specs are temporary working documents (unlike docs which are living).

### Commands

| Command | Description |
|---------|-------------|
| `/fractary-spec:spec-create` | Create specification from conversation context |
| `/fractary-spec:spec-get` | Get specification details by ID or path |
| `/fractary-spec:spec-list` | List specifications with optional filters |
| `/fractary-spec:spec-update` | Update a specification |
| `/fractary-spec:spec-delete` | Delete a specification |
| `/fractary-spec:spec-validate` | Validate specification against implementation |
| `/fractary-spec:spec-refine` | Refine specification through critical review |
| `/fractary-spec:spec-archive` | Archive specifications for completed work |
| `/fractary-spec:template-list` | List available specification templates |

### Agents

| Agent | Trigger | Description |
|-------|---------|-------------|
| `spec-creator` | "create spec", "write spec" | Creates specifications from conversation context, optionally enriched with GitHub issue data. Auto-detects work ID from branch name. |
| `spec-getter` | (via command) | Retrieves specification details by ID or path |
| `spec-lister` | (via command) | Lists specifications with optional filters |
| `spec-updater` | (via command) | Updates a specification by ID |
| `spec-deleter` | (via command) | Deletes a specification by ID |
| `spec-validator` | "validate spec", "check implementation" | Validates that implementation matches specification requirements and acceptance criteria |
| `spec-refiner` | "refine spec", "improve spec" | Critically reviews and refines specifications through interactive Q&A |
| `spec-archiver` | "archive spec", "completed work" | Archives specifications to cloud storage when work is complete. Handles pre-checks, GitHub commenting, and git commits. |
| `template-lister` | (via command) | Lists available specification templates |

### Lifecycle

```
Create -> Validate -> Refine (iterate) -> Archive to cloud
```

### Usage Examples

```
User: Create a spec for the API design we discussed
Claude: [Uses spec-creator agent with conversation context]

User: Check if the implementation matches the spec
Claude: /fractary-spec:spec-validate

User: Issue #123 is done, archive the specs
Claude: /fractary-spec:spec-archive
```

---

## fractary-logs

Log management with per-type classification, session capture, and analysis.

### Commands

| Command | Description |
|---------|-------------|
| `/fractary-logs:log` | Log a specific message or decision to an issue's log |
| `/fractary-logs:list` | List logs with optional filters |
| `/fractary-logs:read` | Read a log entry |
| `/fractary-logs:search` | Search across logs |
| `/fractary-logs:write` | Write a log entry |
| `/fractary-logs:analyze` | Analyze logs for patterns and errors |
| `/fractary-logs:audit` | Audit logs in project and generate management plan |
| `/fractary-logs:capture` | Start session capture |
| `/fractary-logs:cleanup` | Clean up old logs based on age threshold |
| `/fractary-logs:delete` | Delete a log entry |
| `/fractary-logs:archive` | Archive old logs |
| `/fractary-logs:stop` | Stop active session capture |
| `/fractary-logs:validate` | Validate a log file against its type schema |
| `/fractary-logs:types` | List available log types |
| `/fractary-logs:type-info` | Get detailed information about a log type |

### Agents

| Agent | Trigger | Description |
|-------|---------|-------------|
| `logs-analyze` | "analyze logs", "find errors", "log patterns" | Analyzes logs for patterns, errors, summaries, or time analysis |
| `logs-audit` | "audit logs", "log health check" | Audits existing logs, identifies what should be managed, and generates remediation specs |
| `logs-cleanup` | "cleanup logs", "remove old logs", "free space" | Archives and cleans up old logs based on age thresholds |
| `logs-log` | "log message", "record decision", "add to log" | Logs specific messages or decisions to an issue's log |

### Log Types

`session`, `build`, `deployment`, `test`, `debug`, `audit`, `operational`, `workflow` (and more via custom type registry)

---

## fractary-file

Multi-provider file storage with a unified interface.

**Supported providers:** Local, AWS S3, Cloudflare R2, Google Cloud Storage, Google Drive

### Commands

| Command | Description |
|---------|-------------|
| `/fractary-file:upload` | Upload a local file to storage |
| `/fractary-file:download` | Download a file from storage |
| `/fractary-file:list` | List files in storage |
| `/fractary-file:read` | Read content from a storage path |
| `/fractary-file:write` | Write content to a storage path |
| `/fractary-file:delete` | Delete a file from storage |
| `/fractary-file:copy` | Copy a file within storage |
| `/fractary-file:move` | Move a file within storage |
| `/fractary-file:exists` | Check if a file exists |
| `/fractary-file:get-url` | Get a URL for a file |
| `/fractary-file:show-config` | Show file plugin configuration |
| `/fractary-file:switch-handler` | Switch active storage provider |
| `/fractary-file:test-connection` | Test storage connection |

### Agents

| Agent | Trigger | Description |
|-------|---------|-------------|
| `file-upload` | (via command) | Uploads a local file to storage using the CLI |
| `file-download` | (via command) | Downloads a file from storage to local path |
| `file-show-config` | (via command) | Shows file plugin configuration |
| `file-switch-handler` | "switch handler", "use S3", "use local" | Switches the active storage handler to a different configured provider |
| `file-test-connection` | (via command) | Tests storage connection |

---

## fractary-docs

Documentation system with per-type skills, archival, refinement, and fulfillment validation.

### Commands

| Command | Description |
|---------|-------------|
| `/fractary-docs:doc-create` | Create a new document |
| `/fractary-docs:doc-get` | Get a document by ID |
| `/fractary-docs:doc-list` | List documents |
| `/fractary-docs:doc-update` | Update a document |
| `/fractary-docs:doc-delete` | Delete a document |
| `/fractary-docs:doc-search` | Search documents |
| `/fractary-docs:write` | Write documentation (delegates to docs-writer agent) |
| `/fractary-docs:validate` | Validate documentation against type-specific rules |
| `/fractary-docs:refine` | Refine a document by scanning for gaps |
| `/fractary-docs:archive` | Archive a document |
| `/fractary-docs:audit` | Audit documentation quality across the project |
| `/fractary-docs:check-consistency` | Check if docs are consistent with code changes |
| `/fractary-docs:type-list` | List available document types |
| `/fractary-docs:type-info` | Get detailed information about a document type |

### Agents

| Agent | Trigger | Description |
|-------|---------|-------------|
| `docs-archiver` | "archive doc", "move to archive" | Archives documents using the file plugin's configured sources |
| `docs-auditor` | "audit docs", "check documentation", "find doc issues" | Audits documentation across a project identifying issues, gaps, and quality problems |
| `docs-consistency-checker` | "docs out of date", "stale documentation" | Checks if high-level docs (CLAUDE.md, README.md) are consistent with recent code changes |
| `docs-refiner` | "refine doc", "improve spec", "find gaps" | Scans documents for gaps, generates questions, and applies improvements. Works for any document type. |
| `docs-validator` | "validate docs", "check doc format", "lint docs" | Validates documentation against type-specific rules and schemas |
| `docs-writer` | "write docs", "create documentation" | Creates or updates documentation using the CLI and SDK |

### Document Types

`adr`, `api`, `architecture`, `audit`, `changelog`, `dataset`, `etl`, `guides`, `infrastructure`, `standards`, `testing`, `spec-basic`, `spec-feature`, `spec-bug`, `spec-api`, `spec-infrastructure`

---

## fractary-status

Custom Claude Code status line showing git status, issue numbers, PR numbers, and last prompt.

### Commands

| Command | Description |
|---------|-------------|
| `/fractary-status:install` | Install and configure the status line |
| `/fractary-status:sync` | Force-refresh the status line cache |

### Agents

| Agent | Trigger | Description |
|-------|---------|-------------|
| `status-install` | "install status line", "set up status" | Installs and configures custom status line in Claude Code projects |
| `status-sync` | "refresh status", "sync status", "status out of date" | Forces a cache refresh and displays comprehensive repository status |

---

## Commands vs Agents

**Commands** are direct actions you invoke explicitly with `/plugin:command`. They execute a specific operation and return results.

**Agents** are autonomous task handlers that Claude triggers proactively based on conversation context. They handle complex, multi-step workflows and make decisions about how to accomplish a goal. Agents are triggered either:
- Explicitly via a command that delegates to them (e.g., `/fractary-repo:pr-review` delegates to `pr-review-agent`)
- Proactively when Claude detects matching trigger phrases in your conversation

## Other Interfaces

- **CLI:** [Command Reference](../cli/README.md) - Same operations via command line with full option details
- **SDK:** [API Reference](../sdk/js/README.md) - Programmatic TypeScript access
- **MCP:** [Tool Reference](../mcp/server/README.md) - AI agent integration via Model Context Protocol
