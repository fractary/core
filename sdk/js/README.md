# @fractary/core

Fractary Core SDK - Primitive operations for work tracking, repository management, specifications, logging, file storage, and documentation.

## Overview

`@fractary/core` provides foundational SDKs for common development operations across multiple platforms and services. This package is designed to be used by higher-level frameworks like `@fractary/faber` and can also be used standalone for building custom workflows.

## Features

### Work Tracking
Unified interface for work item management across:
- GitHub Issues
- Jira Cloud
- Linear

### Repository Management
Git and repository operations with support for:
- GitHub
- GitLab
- Bitbucket
- Local Git operations

### Specification Management
Create and manage technical specifications with templates and validation.

### Logging
Structured logging and session capture for workflow tracking.

### File Storage
File operations with support for local and cloud storage backends.

### Documentation
Documentation generation and management utilities.

## Installation

```bash
npm install @fractary/core
```

## Usage

### Work Tracking

```typescript
import { WorkManager } from '@fractary/core/work';

const workManager = new WorkManager({
  platform: 'github',
  config: {
    owner: 'myorg',
    repo: 'myrepo',
    token: process.env.GITHUB_TOKEN
  }
});

// Create an issue
const issue = await workManager.createIssue({
  title: 'Add new feature',
  description: 'Description of the feature',
  labels: ['enhancement']
});
```

### Repository Management

```typescript
import { RepoManager } from '@fractary/core/repo';

const repoManager = new RepoManager({
  platform: 'github',
  config: {
    owner: 'myorg',
    repo: 'myrepo',
    token: process.env.GITHUB_TOKEN
  }
});

// Create a branch
await repoManager.createBranch({
  name: 'feature/new-feature',
  from: 'main'
});

// Create a pull request
const pr = await repoManager.createPullRequest({
  title: 'Add new feature',
  head: 'feature/new-feature',
  base: 'main',
  body: 'PR description'
});
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
import { LogsManager } from '@fractary/core/logs';

const logsManager = new LogsManager({
  logDir: './logs'
});

// Start a session
const sessionId = await logsManager.startSession({
  name: 'deployment',
  metadata: { version: '1.0.0' }
});

// Log events
await logsManager.log(sessionId, {
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

## Links

- [GitHub Repository](https://github.com/fractary/core)
- [Documentation](https://docs.fractary.com/core)
- [Issue Tracker](https://github.com/fractary/core/issues)
