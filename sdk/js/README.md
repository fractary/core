# @fractary/core

Core SDK for Fractary - Primitive operations for work tracking, repository management, specifications, logging, file storage, and documentation.

[![npm version](https://img.shields.io/npm/v/@fractary/core.svg)](https://www.npmjs.com/package/@fractary/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

`@fractary/core` provides foundational infrastructure for managing software development workflows across multiple platforms. It implements primitive operations that can be used standalone or as building blocks for higher-level frameworks like `@fractary/faber`.

### Key Features

- **Multi-Platform Work Tracking**: Unified interface for GitHub Issues, Jira, and Linear
- **Repository Management**: Git operations with GitHub, GitLab, and Bitbucket integration
- **Specification Management**: Create, validate, and refine technical specifications
- **Log Management**: Capture, search, and archive session logs
- **File Storage**: Local and remote file operations with validation
- **Documentation Management**: Create, search, and export documentation
- **Type-Safe**: Full TypeScript support with comprehensive type definitions

## Modules

### Work Tracking

Manage work items across GitHub Issues, Jira, and Linear:

- Create, update, and fetch issues
- Manage comments, labels, and milestones
- Search and filter issues
- Track issue state and assignments

**Supported Platforms:**
- GitHub Issues (full support)
- Jira Cloud (full support)
- Linear (full support)

### Repository Management

Git and platform operations:

- Branch management (create, delete, list)
- Commit operations with semantic versioning
- Pull request workflows
- Tag management
- Worktree support
- Multi-platform support (GitHub, GitLab, Bitbucket)

**Supported Platforms:**
- GitHub (full support)
- GitLab (full support)
- Bitbucket (full support)
- Local Git operations (full support)

### Specification Management

Technical specification workflows:

- Create and validate specifications
- Template-based generation
- Refinement and versioning
- Specification search and indexing

### Log Management

Session and operation logging:

- Capture session logs
- Search and filter logs
- Archive and export
- Log type classification

### File Storage

File operations with validation:

- Read, write, list, delete operations
- Pattern matching and filtering
- Local and remote storage
- File validation and safety checks

### Documentation Management

Documentation workflows:

- Create and update documentation
- Search and indexing
- Export to multiple formats
- Version tracking

## Installation

```bash
npm install @fractary/core
```

## Quick Start

```typescript
import { WorkManager, RepoManager, SpecManager } from '@fractary/core';

// Work tracking
const workManager = new WorkManager({
  provider: 'github',
  config: {
    owner: 'myorg',
    repo: 'myrepo',
    token: process.env.GITHUB_TOKEN
  }
});

const issue = await workManager.createIssue({
  title: 'Add user authentication',
  body: 'Implement JWT-based authentication',
  workType: 'feature',
  labels: ['enhancement']
});

// Repository operations
const repoManager = new RepoManager({
  provider: 'github',
  config: {
    owner: 'myorg',
    repo: 'myrepo',
    token: process.env.GITHUB_TOKEN
  }
});

await repoManager.createBranch('feature/auth', { base: 'main' });

// Specification management
const specManager = new SpecManager({ specDirectory: './specs' });
const spec = specManager.createSpec('Authentication System', {
  workId: issue.number.toString(),
  template: 'feature'
});
```

## Usage

### Work Tracking

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

// Create an issue
const issue = await workManager.createIssue({
  title: 'Add new feature',
  body: 'Description of the feature',
  workType: 'feature',
  labels: ['enhancement'],
  assignees: ['developer1']
});

// Fetch an issue
const fetchedIssue = await workManager.fetchIssue(123);

// Search issues
const openBugs = await workManager.searchIssues('is:open label:bug');

// Add comment
await workManager.createComment(123, 'Working on this now');

// Manage labels
await workManager.addLabels(123, ['priority:high', 'needs-review']);
```

### Repository Management

```typescript
import { RepoManager } from '@fractary/core/repo';

const repoManager = new RepoManager({
  provider: 'github',
  config: {
    owner: 'myorg',
    repo: 'myrepo',
    token: process.env.GITHUB_TOKEN
  }
});

// Create a branch
await repoManager.createBranch('feature/new-feature', { base: 'main' });

// Make commits with semantic versioning
repoManager.commit({
  message: 'Add authentication middleware',
  type: 'feat',
  scope: 'auth',
  files: ['src/middleware/auth.ts']
});

// Create a pull request
const pr = await repoManager.createPR({
  title: 'Add new feature',
  body: 'PR description',
  head: 'feature/new-feature',
  base: 'main'
});

// Manage tags
repoManager.createTag('v1.0.0', { message: 'Release 1.0.0' });
repoManager.pushTag('v1.0.0');
```

### Specification Management

```typescript
import { SpecManager } from '@fractary/core/spec';

const specManager = new SpecManager({
  rootDir: './specs'
});

// Create a new spec
await specManager.createSpec({
  id: 'SPEC-001',
  title: 'Authentication System',
  template: 'technical'
});
```

### Logging

```typescript
import { LogManager } from '@fractary/core/logs';

const logManager = new LogManager({
  localPath: './logs'
});

// Start a session
const sessionId = await logManager.startCapture({
  name: 'deployment',
  metadata: { version: '1.0.0' }
});

// Log events
await logManager.log(sessionId, {
  level: 'info',
  message: 'Deployment started'
});
```

## Module Exports

The package provides the following subpath exports:

- `@fractary/core` - All primitives
- `@fractary/core/work` - Work tracking only
- `@fractary/core/repo` - Repository management only
- `@fractary/core/spec` - Specification management only
- `@fractary/core/logs` - Logging only
- `@fractary/core/file` - File storage only
- `@fractary/core/docs` - Documentation only

## TypeScript Support

This package is written in TypeScript and includes type definitions. TypeScript 5.0+ is recommended.

## Requirements

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

## License

MIT

## Contributing

See the [Contributing Guide](../../CONTRIBUTING.md) for details on how to contribute to this project.

## Configuration

Configuration can be provided via files or environment variables:

```yaml
# .fractary/core.yaml
work:
  provider: github
  config:
    owner: myorg
    repo: myrepo
    token: ${GITHUB_TOKEN}

repo:
  provider: github
  config:
    owner: myorg
    repo: myrepo
    token: ${GITHUB_TOKEN}
```

See the [Configuration Guide](../../docs/guides/configuration.md) for details.

## Documentation

- **[API Reference](../../docs/guides/api-reference.md)** - Complete API documentation
- **[Configuration Guide](../../docs/guides/configuration.md)** - Configuration options
- **[Integration Guide](../../docs/guides/integration.md)** - Integration patterns
- **[Examples](../../docs/examples/)** - Usage examples and patterns

## Related Packages

- **[@fractary/core-cli](../../../cli/)** - Command-line interface
- **[@fractary/core-mcp](../../../mcp/server/)** - MCP server for AI agents

## Links

- [GitHub Repository](https://github.com/fractary/core)
- [Issue Tracker](https://github.com/fractary/core/issues)
- [NPM Package](https://www.npmjs.com/package/@fractary/core)
