# Fractary Core SDK (TypeScript)

TypeScript SDK for programmatic access to all Fractary Core toolsets.

**Package:** `@fractary/core` v0.7.17

## Installation

```bash
npm install @fractary/core
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
import { SpecManager } from '@fractary/core/spec';
import { LogManager } from '@fractary/core/logs';
import { FileManager } from '@fractary/core/file';
import { DocsManager } from '@fractary/core/docs';

// Unified import
import { WorkManager, RepoManager, SpecManager, LogManager, FileManager, DocsManager } from '@fractary/core';

// Configuration utilities
import { loadConfig, loadEnv } from '@fractary/core/config';

// Common utilities
import { loadYamlConfig, writeYamlConfig } from '@fractary/core/common/yaml-config';
```

All available entry points:

| Import Path | Contents |
|-------------|----------|
| `@fractary/core` | All managers, factories, config, errors |
| `@fractary/core/config` | Config loading, env management, validation |
| `@fractary/core/work` | WorkManager, types |
| `@fractary/core/repo` | RepoManager, Git, providers |
| `@fractary/core/spec` | SpecManager, templates |
| `@fractary/core/logs` | LogManager, LogTypeRegistry |
| `@fractary/core/file` | FileManager, storage backends |
| `@fractary/core/docs` | DocsManager, DocTypeRegistry |
| `@fractary/core/common/yaml-config` | YAML config read/write utilities |
| `@fractary/core/common/config` | Config path utilities |
| `@fractary/core/common/secrets` | Secret management utilities |

## Configuration

### Using Factory Functions (Recommended)

Factory functions auto-load `.fractary/config.yaml` and handle authentication:

```typescript
import { createWorkManager, createRepoManager, createManagers } from '@fractary/core';

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

## Platform Support

> **Important:** Only GitHub is fully implemented. Other platforms have stub providers that will throw errors at runtime.

### Work Tracking

| Platform | Status |
|----------|--------|
| GitHub Issues | **Full support** |
| Jira Cloud | Stub (not yet functional) |
| Linear | Stub (not yet functional) |

### Repository

| Platform | Status |
|----------|--------|
| GitHub | **Full support** |
| GitLab | Stub (not yet functional) |
| Bitbucket | Stub (not yet functional) |

### File Storage

| Provider | Status | Peer Dependencies |
|----------|--------|-------------------|
| Local | **Full support** | None |
| AWS S3 | **Full support** | `@aws-sdk/client-s3`, `@aws-sdk/credential-providers`, `@aws-sdk/s3-request-presigner` |
| Cloudflare R2 | **Full support** | `@aws-sdk/client-s3` (S3-compatible) |
| Google Cloud Storage | **Full support** | `@google-cloud/storage` |
| Google Drive | **Full support** | `googleapis` |

---

## WorkManager

Manage work items and issues.

### Constructor

```typescript
new WorkManager(config?: WorkConfig)
```

```typescript
interface WorkConfig {
  platform: 'github' | 'jira' | 'linear';
  owner?: string;
  repo?: string;
  project?: string;
  token?: string;
}
```

### Methods

**Issues:**

```typescript
createIssue(options: IssueCreateOptions): Promise<Issue>
fetchIssue(issueId: string | number): Promise<Issue>
updateIssue(issueId: string | number, options: IssueUpdateOptions): Promise<Issue>
closeIssue(issueId: string | number): Promise<Issue>
reopenIssue(issueId: string | number): Promise<Issue>
searchIssues(query: string, filters?: IssueFilters): Promise<Issue[]>
assignIssue(issueId: string | number, assignee: string): Promise<Issue>
unassignIssue(issueId: string | number): Promise<Issue>
```

**Comments:**

```typescript
createComment(issueId: string | number, body: string): Promise<Comment>
listComments(issueId: string | number, options?: ListCommentsOptions): Promise<Comment[]>
```

**Labels:**

```typescript
addLabels(issueId: string | number, labels: string[]): Promise<Label[]>
removeLabels(issueId: string | number, labels: string[]): Promise<void>
setLabels(issueId: string | number, labels: string[]): Promise<Label[]>
listLabels(issueId?: string | number): Promise<Label[]>
```

**Milestones:**

```typescript
createMilestone(options: MilestoneCreateOptions): Promise<Milestone>
setMilestone(issueId: string | number, milestone: string): Promise<Issue>
removeMilestone(issueId: string | number): Promise<Issue>
listMilestones(state?: 'open' | 'closed' | 'all'): Promise<Milestone[]>
```

**Classification:**

```typescript
classifyWorkType(issue: Issue): ClassifyResult
getPlatform(): string
```

### Key Types

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

type WorkType = 'feature' | 'bug' | 'chore' | 'patch' | 'infrastructure' | 'api'

interface ClassifyResult {
  work_type: WorkType;
  confidence: number;    // 0 to 1
  signals: ClassifySignals;
}
```

### Example

```typescript
const workManager = await createWorkManager();

// Create an issue
const issue = await workManager.createIssue({
  title: 'Add OAuth support',
  body: 'Implement OAuth 2.0 for third-party login',
  workType: 'feature',
  labels: ['enhancement'],
});

// Add a comment
await workManager.createComment(issue.number, 'Starting implementation');

// Classify work type
const classification = workManager.classifyWorkType(issue);
console.log(classification.work_type); // 'feature'
```

---

## RepoManager

Repository and Git operations.

### Constructor

```typescript
new RepoManager(config?: RepoConfig, cwd?: string)
```

```typescript
interface RepoConfig {
  platform: 'github' | 'gitlab' | 'bitbucket';
  owner?: string;
  repo?: string;
  token?: string;
  branchPrefixes?: BranchPrefixConfig;
  environments?: Record<string, EnvironmentBranchConfig>;
}
```

### Methods

**Status & Info:**

```typescript
get platform(): string
getStatus(): GitStatus
getCurrentBranch(): string
isDirty(): boolean
isClean(): boolean
getDiff(options?: DiffOptions): string
```

**Branches:**

```typescript
createBranch(name: string, options?: BranchCreateOptions): Promise<Branch>
deleteBranch(name: string, options?: BranchDeleteOptions): Promise<void>
listBranches(options?: BranchListOptions): Promise<Branch[]>
getBranch(name: string): Promise<Branch | null>
checkout(branch: string): void
```

**Staging & Commits:**

```typescript
stage(patterns: string[]): void
stageAll(): void
unstage(patterns: string[]): void
commit(options: CommitOptions): Commit
getCommit(ref: string): Commit
listCommits(options?: CommitListOptions): Commit[]
```

**Push/Pull/Fetch:**

```typescript
push(options?: PushOptions): void
pull(options?: PullOptions): void
fetch(remote?: string): void
```

**Pull Requests:**

```typescript
createPR(options: PRCreateOptions): Promise<PullRequest>
getPR(number: number): Promise<PullRequest>
updatePR(number: number, options: PRUpdateOptions): Promise<PullRequest>
listPRs(options?: PRListOptions): Promise<PullRequest[]>
mergePR(number: number, options?: PRMergeOptions): Promise<PullRequest>
addPRComment(number: number, body: string): Promise<void>
requestReview(number: number, reviewers: string[]): Promise<void>
approvePR(number: number, comment?: string): Promise<void>
reviewPR(number: number, options: PRReviewOptions): Promise<void>
```

**Tags:**

```typescript
createTag(name: string, options?: TagCreateOptions): void
deleteTag(name: string): void
pushTag(name: string, remote?: string): void
listTags(options?: TagListOptions): Tag[]
```

**Worktrees:**

```typescript
createWorktree(options: WorktreeCreateOptions): Worktree
listWorktrees(): Worktree[]
removeWorktree(path: string, force?: boolean): void
pruneWorktrees(): void
cleanupWorktrees(options?: WorktreeCleanupOptions): Promise<WorktreeCleanupResult>
```

**Utilities:**

```typescript
generateBranchName(options: { type: string; description: string; workId?: string }): string
getOrganization(): Promise<string>
getProjectName(): Promise<string>
```

### Example

```typescript
const repoManager = await createRepoManager();

// Create a feature branch
await repoManager.createBranch('feature/oauth', { base: 'main', checkout: true });

// Stage and commit
repoManager.stageAll();
repoManager.commit({ message: 'Add OAuth middleware', type: 'feat', scope: 'auth' });

// Push and create PR
repoManager.push({ setUpstream: true });
const pr = await repoManager.createPR({
  title: 'Feature: OAuth Support',
  body: 'Implements #123',
  base: 'main',
});
```

---

## SpecManager

Technical specification management with templates and validation.

### Constructor

```typescript
new SpecManager(config?: Partial<SpecConfig>)
```

### Methods

```typescript
createSpec(title: string, options?: SpecCreateOptions): Specification
getSpec(idOrPath: string): Specification | null
updateSpec(idOrPath: string, updates: SpecUpdates): Specification
deleteSpec(idOrPath: string): boolean
listSpecs(options?: SpecListOptions): Specification[]
validateSpec(specIdOrPath: string): SpecValidateResult
generateRefinementQuestions(specIdOrPath: string): RefinementQuestion[]
refineSpec(specIdOrPath: string, answers: Record<string, string>): SpecRefineResult
getTemplates(): SpecTemplate[]
```

**Phase & Task Operations:**

```typescript
updatePhase(specIdOrPath: string, phaseId: string, updates: PhaseUpdateOptions): Specification
completeTask(specIdOrPath: string, phaseId: string, taskIndex: number): Specification
addTask(specIdOrPath: string, phaseId: string, taskText: string): Specification
```

### Example

```typescript
const specManager = new SpecManager();

const spec = specManager.createSpec('API Authentication Design', {
  template: 'feature',
  workId: '123',
});

const validation = specManager.validateSpec(spec.id);
console.log(validation.valid, validation.issues);
```

---

## LogManager

Log management with type classification and session capture.

### Constructor

```typescript
new LogManager(config?: LogManagerConfig)
```

### Methods

**Type Registry:**

```typescript
getLogTypes(): LogTypeDefinition[]
getLogType(id: string): LogTypeDefinition | null
hasLogType(id: string): boolean
```

**Log CRUD:**

```typescript
writeLog(options: LogWriteOptions): LogEntry
readLog(idOrPath: string): LogEntry | null
appendToLog(idOrPath: string, options: LogAppendOptions): LogEntry
updateLogStatus(idOrPath: string, status: LogStatus): LogEntry
listLogs(options?: LogListOptions): LogEntry[]
searchLogs(options: LogSearchOptions): LogSearchResult[]
deleteLog(idOrPath: string): boolean
```

**Session Capture:**

```typescript
startCapture(options: CaptureStartOptions): CaptureResult
stopCapture(): CaptureResult | null
getActiveCapture(): CaptureSession | null
logMessage(role: 'user' | 'assistant' | 'system', content: string): void
```

**Archival:**

```typescript
archiveLogs(options?: { maxAgeDays?: number; compress?: boolean }): ArchiveResult
```

---

## FileManager

Multi-provider file storage.

### Constructor

```typescript
new FileManager(config?: FileManagerOptions)
```

### Methods

```typescript
write(path: string, content: string | Buffer): Promise<string>
read(path: string): Promise<string | null>
exists(path: string): Promise<boolean>
list(prefix?: string): Promise<string[]>
delete(path: string): Promise<void>
copy(sourcePath: string, destPath: string): Promise<string>
move(sourcePath: string, destPath: string): Promise<string>
getUrl(path: string, expiresIn?: number): Promise<string | null>
getStorage(): Storage
```

### Storage Backends

```typescript
import { createStorage, LocalStorage, S3Storage, R2Storage, GCSStorage, GDriveStorage } from '@fractary/core/file';

// Create from config
const storage = createStorage({ type: 'local', basePath: './files' });
const storage = createStorage({ type: 's3', bucket: 'my-bucket', region: 'us-east-1' });
```

### Example

```typescript
const fileManager = new FileManager({ basePath: '.fractary/files' });

await fileManager.write('reports/summary.json', JSON.stringify(data));
const content = await fileManager.read('reports/summary.json');
const files = await fileManager.list('reports/');
const url = await fileManager.getUrl('reports/summary.json', 3600);
```

---

## DocsManager

Documentation management with type system.

### Constructor

```typescript
new DocsManager(config: DocsManagerConfig)  // config is required
```

```typescript
interface DocsManagerConfig {
  docsDir: string;             // Required - directory for documents
  defaultFormat?: DocFormat;    // Default: 'markdown'
  metadataMode?: MetadataMode; // Default: 'frontmatter'
}
```

### Methods

```typescript
createDoc(id: string, content: string, metadata: DocMetadata, format?: DocFormat): Promise<Doc>
getDoc(id: string): Promise<Doc | null>
updateDoc(id: string, content: string, metadata?: Partial<DocMetadata>): Promise<Doc | null>
deleteDoc(id: string): Promise<boolean>
listDocs(): Promise<Doc[]>
searchDocs(query: DocSearchQuery): Promise<Doc[]>
docExists(id: string): Promise<boolean>
```

---

## Error Handling

All SDK methods throw typed errors that extend `CoreError`:

```typescript
import { WorkError, RepoError, SpecError, LogError, CoreError } from '@fractary/core';

try {
  const issue = await workManager.fetchIssue(123);
} catch (error) {
  if (error instanceof WorkError) {
    console.error('Work tracking error:', error.message);
  }
}
```

### Error Hierarchy

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
  SpecError
    SpecNotFoundError, SpecExistsError, SpecValidationError
  LogError
    NoActiveSessionError, SessionActiveError, LogNotFoundError
  ProviderError
    AuthenticationError, RateLimitError, NetworkError
```

## Config Validation

```typescript
import { validateConfig, CoreYamlConfigSchema } from '@fractary/core/config';

const result = validateConfig(rawConfig);
if (!result.valid) {
  console.error('Errors:', result.errors);
  console.warn('Warnings:', result.warnings);
}
```

Zod schemas are exported for all config sections: `CoreYamlConfigSchema`, `WorkConfigSchema`, `RepoConfigSchema`, `LogsConfigSchema`, `FileConfigSchema`, `SpecConfigSchema`, `DocsConfigSchema`.

## Other Interfaces

- **CLI:** [Command Reference](../cli/README.md) - Same operations via command line
- **MCP:** [Tool Reference](../mcp/server/README.md) - AI agent integration
- **Plugins:** [Plugin Reference](../plugins/README.md) - Claude Code integration
