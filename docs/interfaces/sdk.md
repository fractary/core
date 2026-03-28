# SDK (TypeScript)

Programmatic access to all Fractary Core toolsets through Manager classes.

**Package:** `@fractary/core`

## Installation

```bash
npm install -g @fractary/core
```

**Node requirement:** >= 18.0.0

## Quick Start

```typescript
import { createWorkManager, createRepoManager } from '@fractary/core';

// Factory functions auto-load config from .fractary/config.yaml
const workManager = await createWorkManager();
const repoManager = await createRepoManager();

// Or create both at once
const { work, repo } = await createManagers();
```

## Import Patterns

Each toolset is available as a separate module for tree-shaking:

```typescript
// Individual imports (recommended)
import { WorkManager } from '@fractary/core/work';
import { RepoManager } from '@fractary/core/repo';
import { LogManager } from '@fractary/core/logs';
import { FileManager } from '@fractary/core/file';
import { DocsManager } from '@fractary/core/docs';

// Unified import
import { WorkManager, RepoManager, LogManager, FileManager, DocsManager } from '@fractary/core';

// Configuration utilities
import { loadConfig, loadEnv } from '@fractary/core/config';
```

| Import Path | Contents |
|-------------|----------|
| `@fractary/core` | All managers, factories, config, errors |
| `@fractary/core/config` | Config loading, env management, validation |
| `@fractary/core/work` | WorkManager, types |
| `@fractary/core/repo` | RepoManager, Git, providers |
| `@fractary/core/logs` | LogManager, LogTypeRegistry |
| `@fractary/core/file` | FileManager, storage backends |
| `@fractary/core/docs` | DocsManager, DocTypeRegistry |
| `@fractary/core/common/yaml-config` | YAML config read/write utilities |

## Configuration

### Factory Functions (Recommended)

Factory functions auto-load `.fractary/config.yaml` and handle authentication:

```typescript
const workManager = await createWorkManager();
const repoManager = await createRepoManager();

// Or with options
const workManager = await createWorkManager({
  cwd: '/path/to/project',
  skipAuth: true,
});
```

### From Configuration File

```typescript
import { loadConfig } from '@fractary/core/config';

const config = await loadConfig();
const workManager = new WorkManager(config.work);
```

### Programmatic Configuration

```typescript
const workManager = new WorkManager({
  platform: 'github',
  owner: 'myorg',
  repo: 'myrepo',
  token: process.env.GITHUB_TOKEN,
});
```

### Environment Management

```typescript
import { loadEnv, switchEnv, getCurrentEnv } from '@fractary/core/config';

loadEnv();                        // Load .env file
switchEnv('staging');              // Switch to staging environment
const env = getCurrentEnv();      // Get current environment name
```

## Error Hierarchy

All SDK methods throw typed errors extending `CoreError`:

```
CoreError
  ConfigurationError
    ConfigNotFoundError, ConfigValidationError
  WorkError
    IssueNotFoundError, IssueCreateError, LabelError, MilestoneError
  RepoError
    BranchExistsError, BranchNotFoundError, ProtectedBranchError
    CommitError, PushError, PRNotFoundError, PRError
    MergeConflictError, DirtyWorkingDirectoryError
  LogError
    NoActiveSessionError, SessionActiveError, LogNotFoundError
  ProviderError
    AuthenticationError, RateLimitError, NetworkError
```

```typescript
import { WorkError } from '@fractary/core';

try {
  const issue = await workManager.fetchIssue(123);
} catch (error) {
  if (error instanceof WorkError) {
    console.error('Work tracking error:', error.message);
  }
}
```

## Config Validation

```typescript
import { validateConfig, CoreYamlConfigSchema } from '@fractary/core/config';

const result = validateConfig(rawConfig);
if (!result.valid) {
  console.error('Errors:', result.errors);
}
```

Zod schemas are exported for all config sections: `CoreYamlConfigSchema`, `WorkConfigSchema`, `RepoConfigSchema`, `LogsConfigSchema`, `FileConfigSchema`, `DocsConfigSchema`.

## Feature References

For detailed API documentation per toolset, see the feature docs:

- **[Work Tracking](../features/work.md)** - WorkManager methods, types, examples
- **[Repository Management](../features/repo.md)** - RepoManager methods, types, examples
- **[File Storage](../features/file.md)** - FileManager methods, types, examples
- **[Log Management](../features/logs.md)** - LogManager methods, types, examples
- **[Documentation](../features/docs.md)** - DocsManager methods, types, examples
