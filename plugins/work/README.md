# Fractary Work Plugin v3.0

Universal work item management across GitHub Issues, Jira Cloud, and Linear.

## Overview

The **Fractary Work Plugin** provides a unified interface for managing issues, tickets, and work items across multiple project management platforms. It uses an agents + commands + skills pattern with MCP-first architecture, abstracting platform-specific differences through handler skills.

**Version:** 3.0.8
**Status:** Production Ready
**Platforms:** GitHub Issues ✅ | Jira Cloud ✅ | Linear ✅

## Key Features

- ✅ **Universal Interface**: Same operations work across all platforms
- ✅ **18 Operations**: Complete CRUD + search + relationships + milestones
- ✅ **100% Feature Parity**: All 3 handlers support identical operations
- ✅ **Normalized Data Model**: Consistent JSON output regardless of platform
- ✅ **Context Efficient**: 3-layer architecture minimizes LLM token usage
- ✅ **Configuration Driven**: Switch platforms without code changes

## Platforms Supported

| Platform | Status | Operations | Features |
|----------|--------|------------|----------|
| **GitHub Issues** | ✅ Complete | 18/18 | gh CLI, label-based states, comment linking |
| **Jira Cloud** | ✅ Complete | 18/18 | REST API v3, ADF format, workflow transitions, JQL |
| **Linear** | ✅ Complete | 18/18 | GraphQL API, native markdown, UUID lookups, cycles |

## Architecture

### Agents + Commands + Skills (MCP-First)

```
Layer 1: Commands (User Interface)
   /fractary-work:issue, /fractary-work:comment, etc.
   ↓
Layer 2: Agents (Orchestration)
   issue-refine, issue-bulk-creator
   ↓
Layer 3: Skills (Platform Abstraction)
   Handler skills + shared utilities
   ↓
Layer 4: Scripts (Deterministic Operations)
```

**Benefits:**
- Agents handle orchestration and decision-making
- Commands provide user-facing entry points
- Handler skills centralize platform-specific logic
- Scripts execute outside LLM context for efficiency

### Components

#### Agents (2)

- **`issue-refine`** - Refine and improve issue content
- **`issue-bulk-creator`** - Create multiple issues in batch

#### Commands (8)

- `issue-comment`, `issue-create-bulk`, `issue-create`, `issue-fetch`
- `issue-list`, `issue-refine`, `issue-search`, `issue-update`

#### Handler Skills (3)

- **handler-work-tracker-github** - GitHub Issues adapter (gh CLI)
- **handler-work-tracker-jira** - Jira Cloud adapter (REST API v3)
- **handler-work-tracker-linear** - Linear adapter (GraphQL)

#### Utility Skills

- **work-common** - Shared utilities (config loading, format conversion)
- **work-initializer** - Plugin initialization

## Prerequisites

### Fractary CLI (Required)

The work plugin requires the Fractary CLI for core operations:

```bash
# Install Fractary CLI globally
npm install -g @fractary/cli

# Verify installation
fractary --version
```

**Minimum CLI Version:** `@fractary/cli >= 0.3.0`

### Additional Dependencies

- **jq** - JSON parsing (usually pre-installed on most systems)
  ```bash
  # macOS
  brew install jq

  # Ubuntu/Debian
  sudo apt-get install jq

  # Windows (via scoop)
  scoop install jq
  ```

## Installation

```bash
# Install plugin
claude plugin install fractary/work

# Set up authentication
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"        # For GitHub
export JIRA_EMAIL="user@example.com"                  # For Jira
export JIRA_TOKEN="jira_api_token"                    # For Jira
export LINEAR_API_KEY="lin_api_xxxxxxxxxxxxxxxxxxxx"  # For Linear
```

## Configuration

Create `.fractary/config.yaml`:

```yaml
work:
  schema_version: "3.0"
  handlers:
    work-tracker:
      active: github
      github:
        owner: myorg
        repo: my-project
        classification:
          feature: [feature, enhancement]
          bug: [bug, fix]
          chore: [chore, maintenance, docs]
          patch: [hotfix, patch, urgent]
        states:
          open: OPEN
          in_progress: OPEN
          in_review: OPEN
          done: CLOSED
          closed: CLOSED
        labels:
          prefix: "faber-"
          in_progress: in-progress
          completed: completed
```

**Template:** See `config/` directory for complete configuration examples with all platforms.

## Commands

The work plugin provides user-facing commands for common operations:

### Setup

- **`fractary-core:config-init`** - Initialize unified configuration
  ```bash
  fractary-core:config-init              # Interactive mode
  ```

### Issue Management

- **`/fractary-work:issue`** - Create, fetch, update, search, and manage issues
  ```bash
  /fractary-work:issue create "Add feature" --type feature
  /fractary-work:issue fetch 123
  /fractary-work:issue list --state open --label bug
  /fractary-work:issue update 123 --title "New title"
  /fractary-work:issue assign 123 @me
  /fractary-work:issue search "authentication"
  ```

### Comments

- **`/fractary-work:comment`** - Create and manage comments
  ```bash
  /fractary-work:comment create 123 "Working on this"
  /fractary-work:comment list 123
  ```

### State Management

- **`/fractary-work:state`** - Manage issue lifecycle states
  ```bash
  /fractary-work:state close 123 --comment "Fixed in PR #456"
  /fractary-work:state reopen 123
  /fractary-work:state transition 123 in_progress
  ```

### Labels

- **`/fractary-work:label`** - Add, remove, and manage labels
  ```bash
  /fractary-work:label add 123 bug
  /fractary-work:label remove 123 wontfix
  /fractary-work:label list 123
  /fractary-work:label set 123 bug high-priority
  ```

### Milestones

- **`/fractary-work:milestone`** - Create and manage milestones
  ```bash
  /fractary-work:milestone create "v1.0" --due 2025-12-31
  /fractary-work:milestone list
  /fractary-work:milestone set 123 "v1.0"
  /fractary-work:milestone remove 123
  ```

**Command Documentation:** See `commands/*.md` for detailed command documentation and examples.

## Global Arguments

All commands support the `--context` argument for passing additional instructions:

```bash
--context "<text>"
```

This argument is always optional and appears as the final argument. When provided, agents prepend the context as additional instructions to their workflow.

**Examples:**

```bash
# Guide issue creation
/fractary-work:issue-create "Add feature" --context "Follow team's issue template"

# Focus issue refinement
/fractary-work:issue-refine 123 --context "Emphasize performance requirements"

# Customize search behavior
/fractary-work:issue-search "auth" --context "Focus on security-related issues"
```

Context arguments follow the `--context` flag pattern as described above.

## Session Tracking

The work plugin automatically posts progress updates to issues when working on issue-linked branches.

### How It Works

- **Automatic Detection**: When you work on a branch named with an issue ID (e.g., `feat/123-add-auth`), the plugin tracks your progress
- **Incremental Updates**: Only posts comments when meaningful work occurs (commits or changes detected)
- **Smart Summaries**: Generates summaries showing:
  - Commits made since last update
  - Commit type breakdown (feat, fix, docs, etc.)
  - Outstanding work (uncommitted changes, test validation)
  - Recommended next steps
- **Performance Optimized**: Reads issue_id from repo plugin cache (fast), falls back to branch parsing if unavailable

### Branch Naming Requirements

Session tracking requires branches to follow this pattern:

```
<type>/<issue_id>-<description>
```

**Examples:**
```bash
feat/123-add-authentication    # Feature work on issue #123
fix/456-login-bug             # Bug fix for issue #456
hotfix/789-security-patch     # Urgent fix for issue #789
chore/111-update-deps         # Maintenance for issue #111
```

**Supported types:** `feat`, `fix`, `chore`, `hotfix`, `patch`

### Configuration

The session tracking hook is installed automatically and runs on Stop events. No additional configuration required.

**To disable:**
- Remove or modify `plugins/work/hooks/hooks.json`

### Example Output

When you stop a Claude Code session after making commits, the plugin posts a comment like:

```markdown
## 🔄 Work Update

_Changes since last update (from `abc1234`)_

### What Was Done

**2 commit(s) made:**

- `def5678` feat: Add user authentication
- `ghi9012` test: Add auth tests

- ✨ **1** feature(s) added
- ✅ **1** test(s) added/updated
- 📁 **8** file(s) modified

### Outstanding Work

- 🧪 **Test validation** - ensure tests pass before merging

### Recommended Next Steps

1. **Run final tests** to validate changes
2. **Create pull request** for review
3. **Address any review feedback**

---
_🤖 Auto-generated work update • Branch: `feat/123-add-auth` • 2025-11-12 16:49 UTC_
```

### Performance Notes

- **Fast Path**: Reads issue_id from repo plugin cache (~10ms)
- **Fallback**: Parses branch name if cache unavailable (~50ms)
- **Early Exit**: Skips comment if no changes detected (no network call)
- **Cache Cleanup**: Automatically removes stale branch references every 20 executions

### Troubleshooting

**Comment not posted:**
- Verify branch name matches pattern: `<type>/<issue_id>-<description>`
- Check GitHub authentication: `gh auth login`
- Ensure issue exists in repository
- Verify network connectivity

**Issue ID not detected:**
- Repo plugin may not be installed (falls back to branch parsing)
- Update repo cache: Issue ID is cached on UserPromptSubmit hook
- Branch name doesn't match expected pattern

## Agent Usage

### Protocol: JSON Request/Response

The work plugin uses structured JSON for all operations:

```bash
claude --agent work-manager '{
  "operation": "fetch",
  "parameters": {"issue_id": "123"}
}'
```

### 18 Supported Operations

#### Read Operations
- `fetch` - Get complete issue details
- `classify` - Determine work type
- `list` - Filter issues by criteria
- `search` - Full-text search

#### Create Operations
- `create` - Create new issue

#### Update Operations
- `update` - Modify title/description
- `update-state` - Change lifecycle state

#### State Operations
- `close` - Close/resolve issue (**CRITICAL**)
- `reopen` - Reopen closed issue

#### Communication
- `comment` - Post comment with metadata

#### Metadata Operations
- `add-label` - Add label to issue
- `remove-label` - Remove label from issue
- `assign` - Assign user to issue
- `unassign` - Remove assignee
- `link` - Create relationship between issues

#### Milestone Operations
- `create-milestone` - Create milestone/sprint/cycle
- `update-milestone` - Update milestone properties
- `assign-milestone` - Assign issue to milestone

### Example Operations

#### Fetch Issue
```bash
claude --agent work-manager '{
  "operation": "fetch",
  "parameters": {"issue_id": "123"}
}'
```

**Response:**
```json
{
  "status": "success",
  "operation": "fetch",
  "result": {
    "id": "123",
    "identifier": "#123",
    "title": "Fix login bug",
    "state": "open",
    "labels": ["bug", "urgent"],
    "platform": "github",
    "url": "https://github.com/..."
  }
}
```

#### Close Issue (CRITICAL for FABER Release)
```bash
claude --agent work-manager '{
  "operation": "close",
  "parameters": {
    "issue_id": "123",
    "close_comment": "Fixed in PR #456",
    "work_id": "abc12345"
  }
}'
```

#### Create Issue
```bash
claude --agent work-manager '{
  "operation": "create",
  "parameters": {
    "title": "Add dark mode",
    "description": "Users want dark mode support",
    "labels": "feature,ui",
    "assignees": "username"
  }
}'
```

#### Search Issues
```bash
claude --agent work-manager '{
  "operation": "search",
  "parameters": {
    "query_text": "login crash",
    "limit": 20
  }
}'
```

## Integration with FABER

The work plugin integrates with all FABER workflow phases:

### Frame Phase
- **Fetch** issue details
- **Classify** work type (/bug, /feature, /chore, /patch)
- **Add label** "faber-in-progress"
- **Post comment** "Frame phase started"

### Build Phase
- **Post comment** with phase updates

### Evaluate Phase
- **Post comment** with test results

### Release Phase (CRITICAL)
- **Close issue**
- **Remove label** "faber-in-progress"
- **Add label** "faber-completed"
- **Post comment** with PR link and deployment info

## Directory Structure

```
work/
├── .claude-plugin/
│   └── plugin.json                              # Plugin manifest (v3.0.8)
├── README.md                                    # This file
├── agents/
│   ├── issue-bulk-creator.md                    # Bulk issue creation agent
│   └── issue-refine.md                          # Issue refinement agent
├── archived/                                    # Archived legacy components
│   ├── README.md
│   ├── agents/                                  # Old agents (v2.0)
│   └── skills/                                  # Old focused skills (v2.0)
├── commands/
│   ├── issue-comment.md                         # Comment management
│   ├── issue-create-bulk.md                     # Bulk issue creation
│   ├── issue-create.md                          # Issue creation
│   ├── issue-fetch.md                           # Fetch issue details
│   ├── issue-list.md                            # List issues
│   ├── issue-refine.md                          # Refine issue content
│   ├── issue-search.md                          # Search issues
│   └── issue-update.md                          # Update issues
├── config/                                      # Configuration templates
├── docs/                                        # Documentation
├── scripts/
│   ├── generate-session-summary.sh              # Session summary generation
│   └── process-comment-queue.sh                 # Comment queue processing
└── skills/
    ├── handler-work-tracker-github/             # GitHub adapter
    ├── handler-work-tracker-jira/               # Jira adapter
    ├── handler-work-tracker-linear/             # Linear adapter
    ├── work-common/                             # Shared utilities
    └── work-initializer/                        # Plugin initialization
```

## Platform Comparison

| Feature | GitHub | Jira | Linear |
|---------|--------|------|--------|
| **API Type** | REST + CLI | REST | GraphQL |
| **States** | 2 (open/closed) | Custom workflows | Team-specific |
| **Labels** | Direct names | Direct names | UUID lookup required |
| **Comments** | Markdown | ADF (converted) | Markdown |
| **Linking** | Via comments | Native API | Native relations |
| **Milestones** | Milestones | Versions/Sprints | Cycles |
| **Cost** | Free (public repos) | $$$ | $$ |
| **Best For** | OSS projects | Enterprise | Modern startups |

## Adding New Platforms

To add support for a new platform:

1. **Create handler directory:**
   ```bash
   mkdir -p skills/handler-work-tracker-{platform}/{scripts,docs}
   ```

2. **Implement 18 scripts** matching existing handlers:
   - Read operations (4): fetch, classify, list, search
   - Create operations (1): create
   - Update operations (2): update, update-state
   - State operations (2): close, reopen
   - Communication (1): comment
   - Metadata (6): add-label, remove-label, assign, unassign, link, assign-milestone
   - Milestone operations (2): create-milestone, update-milestone

3. **Create handler SKILL.md** documenting all operations

4. **Add API reference:** `docs/{platform}-api.md`

5. **Update configuration** template with platform settings

6. **Test all 18 operations** for feature parity

## Migration from v1.x

**Breaking Changes in v2.0:**
- String protocol → JSON protocol
- Monolithic skill → focused skills
- Configuration moved to `.fractary/config.yaml`

**Breaking Changes in v3.0:**
- Focused skills consolidated; old skills moved to `archived/`
- Agent-based orchestration with MCP-first architecture

See `docs/MIGRATION-v1-to-v2.md` for detailed migration guide.

## Testing

See `docs/TESTING.md` for:
- Unit testing per script
- Integration testing (skill → handler)
- Cross-platform consistency tests
- FABER workflow end-to-end tests

## Troubleshooting

### "Issue not found"
- Verify issue ID format (GitHub: 123, Jira: PROJ-123, Linear: TEAM-123)
- Check authentication is valid
- Ensure issue exists in configured repository/project/team

### "Authentication failed"
- Verify environment variables are set
- Check tokens haven't expired
- Test authentication with platform CLI/API

### "Label not found" (Linear)
- Linear requires UUID lookups for labels
- Verify label exists in team settings
- Check label name spelling (case-sensitive)

## Performance

**Benchmarks** (estimated):
- Fetch operation: <500ms
- List operation (50 issues): <2s
- Create/update: <1s

**Optimization:**
- Scripts execute outside LLM context
- Configuration lookups cached where possible
- GraphQL queries optimized (Linear)

## Statistics

**Total Implementation:**
- **2 Agents:** issue-refine, issue-bulk-creator
- **8 Commands:** Full issue management interface
- **5 Skills:** 3 handlers + work-common + work-initializer
- **3 Platforms:** GitHub, Jira, Linear with 100% parity

## Version History

- **v3.0.8** (Current) - MCP-first architecture with agents + commands + skills
- **v2.0.0** (2025-10-29) - Full rewrite with Linear support, 100% feature parity
- **v1.0.0** (2025-10-22) - Initial MVP with GitHub support

## License

Part of the Fractary plugin ecosystem.

## Related Plugins

- **fractary-faber** - Universal workflow orchestration (uses work plugin)
- **fractary-repo** - Source control management (similar architecture)
- **fractary-file** - File storage operations
- **fractary-codex** - Memory and knowledge management

## Contributing

Follow **Fractary Plugin Standards** when contributing:
- Commands never do work (invoke agents)
- Agents never do work (invoke skills)
- Skills coordinate handlers
- Scripts contain deterministic operations
- Documentation uses UPPERCASE XML tags

## Support

- **Issues**: https://github.com/fractary/claude-plugins/issues
- **Documentation**: `specs/SPEC-00003-work-plugin-specification.md`
- **Standards**: `docs/standards/FRACTARY-PLUGIN-STANDARDS.md`
