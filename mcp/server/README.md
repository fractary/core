# @fractary/core-mcp

MCP (Model Context Protocol) server for Fractary Core SDK - provides universal tool access for work tracking, repository management, specifications, logs, file storage, and documentation across any MCP-compatible client.

## Features

- **80 MCP Tools** across 6 modules:
  - Work Tracking (19 tools): Issues, comments, labels, milestones
  - Repository Management (37 tools): Git operations, PRs, branches, tags, worktrees
  - Specifications (5 tools): Create, validate, refine specs
  - Logging (5 tools): Capture, search, archive logs
  - File Storage (7 tools): Read, write, copy, move files
  - Documentation (7 tools): Create, search, export docs

- **5.3x Performance**: Direct SDK integration eliminates CLI subprocess overhead
- **Universal Compatibility**: Works with Claude Code, LangChain, n8n, and any MCP client
- **Multi-Platform Support**: GitHub, GitLab, Bitbucket, Jira, Linear

## Installation

```bash
npm install -g @fractary/core-mcp
```

## Configuration

### Claude Code Integration

Add to your `.claude/settings.json`:

```json
{
  "mcpServers": {
    "fractary-core": {
      "command": "npx",
      "args": ["-y", "@fractary/core-mcp"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

### Environment Variables

| Variable | Description | Required For |
|----------|-------------|--------------|
| `GITHUB_TOKEN` | GitHub personal access token | GitHub operations |
| `JIRA_TOKEN` | Jira API token | Jira operations |
| `JIRA_BASE_URL` | Jira instance URL | Jira operations |
| `JIRA_PROJECT` | Default Jira project key | Jira operations |
| `LINEAR_API_KEY` | Linear API key | Linear operations |
| `GITLAB_TOKEN` | GitLab personal access token | GitLab operations |
| `BITBUCKET_TOKEN` | Bitbucket app password | Bitbucket operations |

### Configuration File

Create `.fractary/config.yaml`:

```yaml
work:
  provider: github
  config:
    owner: your-org
    repo: your-repo
    token: ${GITHUB_TOKEN}

repo:
  provider: github
  config:
    owner: your-org
    repo: your-repo
    token: ${GITHUB_TOKEN}

spec:
  directory: ./specs

logs:
  directory: ./logs

file:
  baseDirectory: ./data

docs:
  directory: ./docs
```

## Available Tools

### Work Module (19 tools)

- `fractary_work_issue_fetch` - Fetch issue details
- `fractary_work_issue_create` - Create new issue
- `fractary_work_issue_update` - Update issue
- `fractary_work_issue_assign` - Assign issue to user
- `fractary_work_issue_unassign` - Remove assignee
- `fractary_work_issue_close` - Close issue
- `fractary_work_issue_reopen` - Reopen issue
- `fractary_work_issue_search` - Search issues
- `fractary_work_issue_classify` - Classify work type
- `fractary_work_comment_create` - Add comment
- `fractary_work_comment_list` - List comments
- `fractary_work_label_add` - Add labels
- `fractary_work_label_remove` - Remove labels
- `fractary_work_label_set` - Set labels (replace all)
- `fractary_work_label_list` - List labels
- `fractary_work_milestone_create` - Create milestone
- `fractary_work_milestone_list` - List milestones
- `fractary_work_milestone_set` - Set milestone on issue
- `fractary_work_milestone_remove` - Remove milestone

### Repository Module (37 tools)

- `fractary_repo_status` - Get repository status
- `fractary_repo_branch_current` - Get current branch
- `fractary_repo_is_dirty` - Check for uncommitted changes
- `fractary_repo_diff` - Get diff
- `fractary_repo_branch_create` - Create branch
- `fractary_repo_branch_delete` - Delete branch
- `fractary_repo_branch_list` - List branches
- `fractary_repo_branch_get` - Get branch details
- `fractary_repo_checkout` - Checkout branch
- `fractary_repo_branch_name_generate` - Generate semantic branch name
- `fractary_repo_stage` - Stage files
- `fractary_repo_stage_all` - Stage all changes
- `fractary_repo_unstage` - Unstage files
- `fractary_repo_commit` - Create commit
- `fractary_repo_commit_get` - Get commit details
- `fractary_repo_commit_list` - List commits
- `fractary_repo_push` - Push to remote
- `fractary_repo_pull` - Pull from remote
- `fractary_repo_fetch` - Fetch from remote
- `fractary_repo_pr_create` - Create pull request
- `fractary_repo_pr_get` - Get PR details
- `fractary_repo_pr_update` - Update PR
- `fractary_repo_pr_comment` - Comment on PR
- `fractary_repo_pr_review` - Review PR
- `fractary_repo_pr_request_review` - Request reviewers
- `fractary_repo_pr_approve` - Approve PR
- `fractary_repo_pr_merge` - Merge PR
- `fractary_repo_pr_list` - List PRs
- `fractary_repo_tag_create` - Create tag
- `fractary_repo_tag_delete` - Delete tag
- `fractary_repo_tag_push` - Push tag
- `fractary_repo_tag_list` - List tags
- `fractary_repo_worktree_create` - Create worktree
- `fractary_repo_worktree_list` - List worktrees
- `fractary_repo_worktree_remove` - Remove worktree
- `fractary_repo_worktree_prune` - Prune stale worktrees
- `fractary_repo_worktree_cleanup` - Cleanup worktrees

### Spec Module (5 tools)

- `fractary_spec_create` - Create specification
- `fractary_spec_read` - Read spec content
- `fractary_spec_list` - List specs
- `fractary_spec_validate` - Validate spec
- `fractary_spec_refine` - Refine spec with feedback

### Logs Module (5 tools)

- `fractary_logs_capture` - Capture log entry
- `fractary_logs_read` - Read log entry
- `fractary_logs_search` - Search logs
- `fractary_logs_list` - List log entries
- `fractary_logs_archive` - Archive logs

### File Module (7 tools)

- `fractary_file_read` - Read file
- `fractary_file_write` - Write file
- `fractary_file_list` - List files
- `fractary_file_delete` - Delete file
- `fractary_file_exists` - Check file exists
- `fractary_file_copy` - Copy file
- `fractary_file_move` - Move file

### Docs Module (7 tools)

- `fractary_docs_create` - Create documentation
- `fractary_docs_read` - Read doc content
- `fractary_docs_update` - Update documentation
- `fractary_docs_delete` - Delete documentation
- `fractary_docs_list` - List docs
- `fractary_docs_search` - Search docs
- `fractary_docs_export` - Export docs

## Usage Example

### With Claude Code

```javascript
// Tools are automatically available in Claude Code
// Example: Fetch an issue
Tool: fractary_work_issue_fetch
Parameters: { "issue_number": "123" }

// Create a branch
Tool: fractary_repo_branch_create
Parameters: { "name": "feature/new-feature", "base_branch": "main" }

// Create a pull request
Tool: fractary_repo_pr_create
Parameters: {
  "title": "Add new feature",
  "body": "Description of changes"
}
```

### Programmatic Use

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerAllTools, registerAllHandlers } from '@fractary/core-mcp';
import { loadConfig } from '@fractary/core-mcp';

const config = await loadConfig();
const server = new Server(
  { name: 'fractary-core', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

registerAllTools(server);
registerAllHandlers(server, config);

const transport = new StdioServerTransport();
await server.connect(transport);
```

## Performance

| Operation | CLI Time | MCP Time | Speedup |
|-----------|----------|----------|---------|
| Single issue fetch | 800ms | 150ms | 5.3x |
| 10 operations | 8000ms | 1500ms | 5.3x |
| Branch + commit + PR | 2400ms | 450ms | 5.3x |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode
npm run dev

# Lint
npm run lint

# Type check
npm run typecheck
```

## License

MIT

## Documentation

- **[MCP Server Documentation](../../../README.md#mcp-server)** - Server setup and integration
- **[Configuration Guide](../../../docs/guides/configuration.md)** - Configuration options
- **[Integration Guide](../../../docs/guides/integration.md)** - Integration patterns
- **[API Reference](../../../docs/guides/api-reference.md)** - Complete tool reference

## Related Packages

- **[@fractary/core](../../sdk/js/)** - Core SDK for JavaScript/TypeScript
- **[@fractary/core-cli](../../cli/)** - Command-line interface

## Links

- [GitHub Repository](https://github.com/fractary/core)
- [Issue Tracker](https://github.com/fractary/core/issues)
- [NPM Package](https://www.npmjs.com/package/@fractary/core-mcp)
- [MCP Protocol Specification](https://spec.modelcontextprotocol.io/)
