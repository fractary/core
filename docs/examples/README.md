# Fractary Core Examples

Real-world usage examples and integration patterns for Fractary Core SDK, CLI, and MCP server.

## Table of Contents

- [SDK Examples](#sdk-examples)
- [CLI Examples](#cli-examples)
- [MCP Server Examples](#mcp-server-examples)
- [Integration Examples](#integration-examples)
- [Workflow Examples](#workflow-examples)

## SDK Examples

### Basic Issue Management

```typescript
import { WorkManager } from '@fractary/core/work';

const workManager = new WorkManager({
  provider: 'github',
  config: {
    owner: 'myorg',
    repo: 'myrepo',
    token: process.env.GITHUB_TOKEN
  }
});

// Create a bug issue
async function reportBug(title: string, description: string) {
  const issue = await workManager.createIssue({
    title,
    body: description,
    workType: 'bug',
    labels: ['bug', 'needs-triage']
  });

  console.log(`Created bug report: ${issue.url}`);
  return issue;
}

// Search for open bugs
async function findOpenBugs() {
  const bugs = await workManager.searchIssues('is:open label:bug');
  console.log(`Found ${bugs.length} open bugs`);
  return bugs;
}

// Usage
await reportBug('Login fails on Safari', 'Users cannot log in using Safari browser');
const openBugs = await findOpenBugs();
```

### Feature Branch Workflow

```typescript
import { WorkManager } from '@fractary/core/work';
import { RepoManager } from '@fractary/core/repo';
import { SpecManager } from '@fractary/core/spec';

// Initialize managers
const workManager = new WorkManager({ /* config */ });
const repoManager = new RepoManager({ /* config */ });
const specManager = new SpecManager({ specDirectory: './specs' });

async function startFeature(title: string, description: string) {
  // 1. Create issue
  const issue = await workManager.createIssue({
    title,
    body: description,
    workType: 'feature'
  });

  // 2. Create specification
  const spec = specManager.createSpec(title, {
    workId: issue.number.toString(),
    workType: 'feature',
    template: 'feature'
  });

  // 3. Create feature branch
  const branchName = repoManager.generateBranchName({
    type: 'feature',
    description: title,
    workId: issue.number.toString()
  });

  const branch = await repoManager.createBranch(branchName, {
    base: 'main'
  });

  // 4. Add comment to issue
  await workManager.createComment(
    issue.number,
    `🚀 Feature development started\\n\\n` +
    `- Specification: ${spec.path}\\n` +
    `- Branch: ${branch.name}`
  );

  return { issue, spec, branch };
}

// Usage
const feature = await startFeature(
  'User authentication',
  'Implement JWT-based authentication with refresh tokens'
);
```

### Complete Development Workflow

```typescript
import { WorkManager, RepoManager, SpecManager, LogsManager } from '@fractary/core';

class FeatureWorkflow {
  constructor(
    private work: WorkManager,
    private repo: RepoManager,
    private spec: SpecManager,
    private logs: LogsManager
  ) {}

  async start(title: string, description: string) {
    // Create issue
    const issue = await this.work.createIssue({
      title,
      body: description,
      workType: 'feature'
    });

    // Start log capture
    this.logs.startCapture({
      issueNumber: issue.number,
      redactSensitive: true
    });

    // Create spec
    const spec = this.spec.createSpec(title, {
      workId: issue.number.toString(),
      template: 'feature'
    });

    // Create branch
    const branchName = this.repo.generateBranchName({
      type: 'feature',
      description: title,
      workId: issue.number.toString()
    });

    await this.repo.createBranch(branchName, { base: 'main' });

    return { issue, spec };
  }

  async complete(issueNumber: number, prTitle: string, prBody: string) {
    // Validate spec
    const spec = this.spec.listSpecs({
      workId: issueNumber.toString()
    })[0];

    const validation = this.spec.validateSpec(spec.id);
    if (validation.status === 'fail') {
      throw new Error('Specification validation failed');
    }

    // Create pull request
    const pr = await this.repo.createPR({
      title: prTitle,
      body: prBody,
      base: 'main'
    });

    // Update issue
    await this.work.createComment(
      issueNumber,
      `✅ Pull request created: ${pr.url}`
    );

    // Stop log capture
    this.logs.stopCapture();

    return pr;
  }
}

// Usage
const workflow = new FeatureWorkflow(
  workManager,
  repoManager,
  specManager,
  logsManager
);

const { issue, spec } = await workflow.start(
  'Add dark mode',
  'Implement dark mode theme switching'
);

// ... development work ...

const pr = await workflow.complete(
  issue.number,
  'Add dark mode support',
  'Implements dark mode with theme switching'
);
```

## CLI Examples

### Automated Release Script

```bash
#!/bin/bash
# release.sh - Automated release workflow

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: ./release.sh <version>"
  exit 1
fi

echo "Creating release $VERSION..."

# 1. Create release issue
ISSUE_JSON=$(fractary-core work issue create "Release $VERSION" \
  --type task \
  --labels "release" \
  --json)

ISSUE_NUM=$(echo $ISSUE_JSON | jq -r '.data.number')

echo "Created release issue #$ISSUE_NUM"

# 2. Create release branch
fractary-core repo branch create "release/$VERSION"

# 3. Update version in package.json
npm version $VERSION --no-git-tag-version

# 4. Commit version bump
fractary-core repo commit \
  --message "Bump version to $VERSION" \
  --type chore \
  --scope release

# 5. Create and push tag
fractary-core repo tag create "v$VERSION" \
  --message "Release $VERSION"

fractary-core repo push --set-upstream

# 6. Create pull request
PR_JSON=$(fractary-core repo pr create "Release $VERSION" \
  --body "Release version $VERSION" \
  --base main \
  --json)

PR_URL=$(echo $PR_JSON | jq -r '.data.url')

# 7. Update issue with PR
fractary-core work comment create $ISSUE_NUM \
  "Release PR created: $PR_URL"

echo "Release $VERSION prepared successfully!"
echo "Issue: #$ISSUE_NUM"
echo "PR: $PR_URL"
```

### Daily Automation Script

```bash
#!/bin/bash
# daily-tasks.sh - Daily maintenance tasks

# Archive old logs (keep last 90 days)
fractary-core logs archive --max-age 90

# Validate all specs
fractary-core spec validate --all

# List stale branches (no activity for 30 days)
fractary-core repo branch list --stale --days 30

# Search for critical bugs
fractary-core work issue search \
  --query "is:open label:bug label:critical" \
  --json | jq '.data | length'

# Clean up old worktrees
fractary-core repo worktree cleanup --stale
```

### Feature Development Script

```bash
#!/bin/bash
# start-feature.sh - Start new feature development

TITLE=$1
DESCRIPTION=$2

if [ -z "$TITLE" ]; then
  echo "Usage: ./start-feature.sh '<title>' '<description>'"
  exit 1
fi

# Create issue
ISSUE_JSON=$(fractary-core work issue create "$TITLE" \
  --type feature \
  --body "$DESCRIPTION" \
  --json)

ISSUE_NUM=$(echo $ISSUE_JSON | jq -r '.data.number')

# Create spec
fractary-core spec create "$TITLE" \
  --work-id "$ISSUE_NUM" \
  --template feature

# Create branch
BRANCH_NAME="feature/$ISSUE_NUM-$(echo "$TITLE" | tr ' ' '-' | tr '[:upper:]' '[:lower:]')"
fractary-core repo branch create "$BRANCH_NAME"

# Start log capture
fractary-core logs capture $ISSUE_NUM

echo "Feature started!"
echo "Issue: #$ISSUE_NUM"
echo "Branch: $BRANCH_NAME"
```

## MCP Server Examples

### Claude Code Integration

`.claude/settings.json`:
```json
{
  "mcpServers": {
    "fractary-core": {
      "command": "npx",
      "args": ["-y", "@fractary/core-mcp"],
      "env": {
        "GITHUB_TOKEN": "ghp_your_token_here",
        "FRACTARY_SPEC_DIRECTORY": "./specs",
        "FRACTARY_LOGS_DIRECTORY": "./logs"
      }
    }
  }
}
```

### Custom MCP Server

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { allTools, handleToolCall } from '@fractary/core-mcp';

const server = new Server(
  { name: 'custom-fractary', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// Add custom tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    ...allTools,
    {
      name: 'custom_deploy',
      description: 'Custom deployment tool',
      inputSchema: { /* ... */ }
    }
  ]
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'custom_deploy') {
    // Custom logic
    return { content: [{ type: 'text', text: 'Deployed!' }] };
  }

  return handleToolCall(name, args || {}, config);
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

## Integration Examples

### Express.js API Server

See [express-api.ts](./express-api.ts) for a complete Express.js integration example.

### Next.js Application

See [nextjs-app.ts](./nextjs-app.ts) for a Next.js integration example.

### GitHub Actions Workflow

See [github-actions.yml](./github-actions.yml) for CI/CD integration.

## Workflow Examples

### Bug Fix Workflow

```typescript
async function bugFixWorkflow(bugTitle: string, bugDescription: string) {
  // 1. Create bug issue
  const issue = await workManager.createIssue({
    title: bugTitle,
    body: bugDescription,
    workType: 'bug',
    labels: ['bug', 'needs-triage']
  });

  // 2. Create hotfix branch
  const branchName = `hotfix/${issue.number}-${slugify(bugTitle)}`;
  await repoManager.createBranch(branchName, { base: 'main' });

  // 3. Start log capture
  logsManager.startCapture({
    issueNumber: issue.number,
    redactSensitive: true
  });

  return issue;
}
```

### Release Workflow

```typescript
async function releaseWorkflow(version: string) {
  // 1. Create release issue
  const issue = await workManager.createIssue({
    title: `Release ${version}`,
    workType: 'task',
    labels: ['release']
  });

  // 2. Create release branch
  await repoManager.createBranch(`release/${version}`, { base: 'develop' });

  // 3. Create release spec
  specManager.createSpec(`Release ${version}`, {
    workId: issue.number.toString(),
    template: 'basic'
  });

  // 4. Create tag
  repoManager.createTag(`v${version}`, {
    message: `Release ${version}`,
    annotated: true
  });

  return issue;
}
```

## Additional Examples

See individual example files:

- [express-api.ts](./express-api.ts) - Express.js API integration
- [nextjs-app.ts](./nextjs-app.ts) - Next.js application integration
- [github-actions.yml](./github-actions.yml) - GitHub Actions workflows
- [workflow-automation.ts](./workflow-automation.ts) - Advanced workflow automation

## Running Examples

```bash
# Clone the repository
git clone https://github.com/fractary/core.git
cd core/docs/examples

# Install dependencies
npm install

# Run TypeScript examples
ts-node express-api.ts
ts-node workflow-automation.ts

# Run shell script examples
chmod +x *.sh
./start-feature.sh "My Feature" "Feature description"
./release.sh "1.0.0"
```

## Best Practices

1. **Error Handling** - Always handle errors from SDK methods
2. **Configuration** - Use configuration files for reusable settings
3. **Logging** - Use the logs module for audit trails
4. **Validation** - Validate specs and inputs before operations
5. **Documentation** - Document custom workflows and integrations

## Next Steps

- [API Reference](../guides/api-reference.md) - Complete API documentation
- [Configuration Guide](../guides/configuration.md) - Configuration options
- [Integration Guide](../guides/integration.md) - Integration patterns
