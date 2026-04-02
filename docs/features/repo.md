# Repository Management

Source control and Git operations across platforms. Manage branches, commits, pull requests, tags, and worktrees with both local Git and remote platform integration.

## Contents

- [Platform Support](#platform-support)
- [Configuration](#configuration) - config.yaml reference, handler setup, environments, PR defaults, worktrees
- [Branch Operations](#branch-operations) - create, delete, list, checkout, generate names
- [Commit Operations](#commit-operations) - stage, commit, push, pull
- [Pull Request Operations](#pull-request-operations) - create, merge, review, list
- [Compound Workflows](#compound-workflows) - commit-push, commit-push-pr, commit-push-pr-merge
- [Tag Operations](#tag-operations) - create, delete, push, list
- [Worktree Operations](#worktree-operations) - create, list, remove, cleanup
- [Status & Info](#status--info) - repo status, current branch, diff, dirty check
- [Skills](#skills) - pr-reviewer
- [Types & Schemas](#types--schemas) - TypeScript interfaces
- [Error Handling](#error-handling) - SDK errors, CLI exit codes, MCP error codes

---

## Platform Support

| Platform | Status | Handler Key |
|----------|--------|-------------|
| GitHub | **Full support** | `github` |
| GitLab | Stub (not yet functional) | `gitlab` |
| Bitbucket | Stub (not yet functional) | `bitbucket` |

## Configuration

The `repo:` section of `.fractary/config.yaml` controls repository operations across all interfaces.

### Minimal Configuration

```yaml
repo:
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
| `active_handler` | string | Yes | Active platform: `github`, `gitlab`, or `bitbucket` |
| `handlers` | object | Yes | At least one handler must be configured |
| `defaults` | object | No | Default values for repo operations (see below) |
| `faber_integration` | object | No | FABER workflow integration settings |
| `hooks` | object | No | Webhook configuration |
| `platform_specific` | object | No | Platform-specific settings |

### Handler: GitHub

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `owner` | string | Yes | - | GitHub organization or user |
| `repo` | string | Yes | - | Repository name |
| `token` | string | Yes | - | Personal access token (use `${GITHUB_TOKEN}`) |
| `api_url` | string | No | `https://api.github.com` | API endpoint (for GitHub Enterprise) |

### Handler: GitLab (Stub)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `owner` | string | Yes | GitLab group or user |
| `repo` | string | Yes | Repository name |
| `token` | string | Yes | GitLab personal access token (use `${GITLAB_TOKEN}`) |
| `api_url` | string | No | GitLab instance URL |

### Handler: Bitbucket (Stub)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `workspace` | string | Yes | Bitbucket workspace |
| `repo_slug` | string | Yes | Repository slug |
| `token` | string | Yes | Bitbucket app password (use `${BITBUCKET_TOKEN}`) |

### Defaults

The `defaults` section controls behavior for repository operations.

#### Environments

Map environment names to branch configurations. This replaces the legacy `default_branch` field.

```yaml
defaults:
  environments:
    prod:
      branch: main
      protected: true
      deploy_target: production
    test:
      branch: test
      protected: false
    staging:
      branch: staging
      protected: false
      deploy_target: staging
  default_environment: test
```

| Field | Type | Description |
|-------|------|-------------|
| `environments.<name>.branch` | string | Branch name for this environment |
| `environments.<name>.protected` | boolean | Require approval for direct push |
| `environments.<name>.deploy_target` | string | Optional CI/CD deploy target name |
| `default_environment` | string | Which environment is the default context |

#### Branch & Commit Defaults

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `protected_branches` | string[] | - | Branches requiring approval for push |
| `branch_naming` | object | - | Branch naming pattern configuration |
| `commit_format` | string | - | Commit message format specification |
| `require_signed_commits` | boolean | `false` | Require GPG-signed commits |
| `merge_strategy` | string | `squash` | Default merge strategy: `squash`, `merge`, `rebase` |
| `auto_delete_merged_branches` | boolean | `false` | Auto-delete branches after merge |

#### Pull Request Defaults

```yaml
defaults:
  pr:
    template: .github/PULL_REQUEST_TEMPLATE.md
    require_work_id: false
    auto_link_issues: true
    ci_polling:
      enabled: true
      interval_seconds: 30
      timeout_seconds: 600
      initial_delay_seconds: 10
    merge:
      strategy: squash
      delete_branch: true
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `pr.template` | string | - | Path to PR template |
| `pr.require_work_id` | boolean | `false` | Require work item ID in PRs |
| `pr.auto_link_issues` | boolean | `true` | Auto-link referenced issues |
| `pr.ci_polling.enabled` | boolean | `true` | Enable CI status polling |
| `pr.ci_polling.interval_seconds` | number | `30` | Polling interval |
| `pr.ci_polling.timeout_seconds` | number | `600` | Total timeout |
| `pr.ci_polling.initial_delay_seconds` | number | `10` | Delay before first poll |
| `pr.merge.strategy` | string | `squash` | Default merge strategy |
| `pr.merge.delete_branch` | boolean | `true` | Delete branch after merge |

#### Sync & Remote

| Field | Type | Description |
|-------|------|-------------|
| `push_sync_strategy` | string | Push synchronization strategy |
| `pull_sync_strategy` | string | Pull synchronization strategy |
| `remote` | object | Remote configuration |

### Worktree Configuration

```yaml
repo:
  worktree:
    location: .claude/worktrees
    naming:
      with_work_id: work-id-{id}
      default: random-words
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `worktree.location` | string | `.claude/worktrees` | Base directory for worktrees |
| `worktree.naming.with_work_id` | string | `work-id-{id}` | Naming pattern when linked to a work item |
| `worktree.naming.default` | string | `random-words` | Naming strategy when no work ID |

---

## Branch Operations

### Quick Reference

| Operation | SDK | CLI | MCP | Plugin |
|-----------|-----|-----|-----|--------|
| [Create](#create-branch) | [`createBranch(name, opts)`](#create-branch-sdk) | [`branch-create`](#create-branch-cli) | [`branch_create`](#create-branch-mcp) | [`/branch-create`](#create-branch-plugin) |
| [Delete](#delete-branch) | [`deleteBranch(name, opts)`](#delete-branch-sdk) | [`branch-delete`](#delete-branch-cli) | [`branch_delete`](#delete-branch-mcp) | - |
| [List](#list-branches) | [`listBranches(opts)`](#list-branches-sdk) | [`branch-list`](#list-branches-cli) | [`branch_list`](#list-branches-mcp) | - |
| [Forward](#forward-branch) | - | - | - | [`/branch-forward`](#forward-branch-plugin) |
| [Generate Name](#generate-branch-name) | [`generateBranchName(opts)`](#generate-branch-name-sdk) | - | [`branch_name_generate`](#generate-branch-name-mcp) | - |

> CLI commands are prefixed with `fractary-core repo` (e.g., `fractary-core repo branch-create`).

---

### Create Branch

Create a new Git branch.

#### Create Branch: SDK

```typescript
const branch = await repoManager.createBranch('feature/auth', {
  base: 'develop',
  checkout: true
});
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Branch name |
| `options.base` | string | No | Base branch (default: main) |
| `options.checkout` | boolean | No | Checkout after creation |

**Returns:** `Promise<Branch>`

#### Create Branch: CLI

```bash
fractary-core repo branch-create feature/auth
fractary-core repo branch-create feature/auth --base develop --checkout
```

| Flag | Description |
|------|-------------|
| `--base <branch>` | Base branch |
| `--checkout` | Checkout after creation |
| `--json` | Output as JSON |

#### Create Branch: MCP

Tool: `fractary_repo_branch_create`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Branch name |
| `base_branch` | string | No | Base branch |
| `from_protected` | boolean | No | Allow creating from protected branch |

#### Create Branch: Plugin

Command: `/fractary-repo-branch-create`

| Argument | Required | Description |
|----------|----------|-------------|
| `<branch-name>` | Yes | Branch name |
| `--base <branch>` | No | Base branch |
| `--checkout` | No | Checkout after creation |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI (`fractary-core repo branch-create`). No agent delegation.

---

### Delete Branch

#### Delete Branch: SDK

```typescript
await repoManager.deleteBranch('feature/old', { force: true, remote: true });
```

#### Delete Branch: CLI

```bash
fractary-core repo branch-delete feature/old
fractary-core repo branch-delete feature/old --location both --force
```

| Flag | Description |
|------|-------------|
| `--location <where>` | `local`, `remote`, or `both` (default: `local`) |
| `--force` | Force delete unmerged branch |
| `--json` | Output as JSON |

#### Delete Branch: MCP

Tool: `fractary_repo_branch_delete`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Branch name |
| `force` | boolean | No | Force delete |
| `location` | string | No | `local`, `remote`, or `both` |

---

### List Branches

#### List Branches: SDK

```typescript
const branches = await repoManager.listBranches({ remote: true, merged: true });
```

#### List Branches: CLI

```bash
fractary-core repo branch-list
fractary-core repo branch-list --merged --pattern "feature/*"
```

| Flag | Description |
|------|-------------|
| `--merged` | Show only merged branches |
| `--stale` | Show only stale branches |
| `--pattern <pattern>` | Filter by pattern |
| `--limit <n>` | Limit results (default: 20) |
| `--json` | Output as JSON |

#### List Branches: MCP

Tool: `fractary_repo_branch_list`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pattern` | string | No | Filter pattern |
| `merged` | boolean | No | Only merged branches |
| `limit` | number | No | Max results |

---

### Forward Branch

Merge a source branch into a target branch via git merge. The PR remains open. Useful for keeping long-lived branches in sync.

#### Forward Branch: Plugin

Command: `/fractary-repo-branch-forward`

| Argument | Required | Description |
|----------|----------|-------------|
| `--target <branch>` | Yes | Target branch to merge into |
| `--source <branch>` | No | Source branch (default: current) |
| `--create-from <branch>` | No | Create target from this branch if it doesn't exist |
| `--push` | No | Push after merge |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI (`fractary-core repo branch-forward`). No agent delegation.

> This operation is plugin/CLI-only. Not available through SDK or MCP.

---

### Generate Branch Name

Generate a semantic branch name from type, description, and optional work ID.

#### Generate Branch Name: SDK

```typescript
const name = repoManager.generateBranchName({
  type: 'feature',
  description: 'user authentication',
  workId: '123'
});
// Returns: 'feature/123-user-authentication'
```

#### Generate Branch Name: MCP

Tool: `fractary_repo_branch_name_generate`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | `feature`, `fix`, `chore`, `docs` |
| `description` | string | Yes | Brief description |
| `work_id` | string | No | Work item ID |

---

## Commit Operations

### Quick Reference

| Operation | SDK | CLI | MCP | Plugin |
|-----------|-----|-----|-----|--------|
| [Commit](#commit) | [`commit(opts)`](#commit-sdk) | [`commit`](#commit-cli) | [`commit`](#commit-mcp) | [`/commit`](#commit-plugin) |
| [Stage](#stage-files) | [`stage(patterns)`](#stage-files-sdk) | via `--all` flag | [`stage`](#stage-files-mcp) | - |
| [Push](#push) | [`push(opts)`](#push-sdk) | [`push`](#push-cli) | [`push`](#push-mcp) | - |
| [Pull](#pull) | [`pull(opts)`](#pull-sdk) | [`pull`](#pull-cli) | [`pull`](#pull-mcp) | [`/pull`](#pull-plugin) |

---

### Commit

Create a commit with conventional commit format.

#### Commit: SDK

```typescript
repoManager.stageAll();
const commit = repoManager.commit({
  message: 'Add JWT authentication',
  type: 'feat',
  scope: 'auth',
  breaking: false
});
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | string | Yes | Commit message |
| `type` | CommitType | No | `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test` |
| `scope` | string | No | Commit scope |
| `breaking` | boolean | No | Breaking change flag |
| `body` | string | No | Extended description |
| `files` | string[] | No | Files to stage |

**Returns:** `Commit`

#### Commit: CLI

```bash
fractary-core repo commit --message "Add feature" --type feat --scope auth
fractary-core repo commit --message "Change API" --type feat --breaking --all
fractary-core repo commit --message "Fix bug" --type fix --work-id 123
```

| Flag | Description |
|------|-------------|
| `--message <msg>` | Commit message (required) |
| `--type <type>` | Conventional commit type |
| `--scope <scope>` | Commit scope |
| `--work-id <id>` | Work item ID to link |
| `--breaking` | Mark as breaking change |
| `--all` | Stage all changes before committing |
| `--json` | Output as JSON |

#### Commit: MCP

Tool: `fractary_repo_commit`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | string | Yes | Commit message |
| `type` | string | No | Conventional commit type |
| `scope` | string | No | Commit scope |
| `body` | string | No | Extended description |
| `breaking` | boolean | No | Breaking change |
| `work_id` | string | No | Work item ID |

#### Commit: Plugin

Command: `/fractary-repo-commit`

| Argument | Required | Description |
|----------|----------|-------------|
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI. The plugin analyzes staged changes and generates an appropriate conventional commit message.

---

### Stage Files

#### Stage Files: SDK

```typescript
repoManager.stage(['src/auth.ts', 'tests/auth.test.ts']);
repoManager.stageAll();
repoManager.unstage(['temp.ts']);
```

#### Stage Files: MCP

Tools: `fractary_repo_stage`, `fractary_repo_stage_all`, `fractary_repo_unstage`

---

### Push

#### Push: SDK

```typescript
repoManager.push({ setUpstream: true });
```

#### Push: CLI

```bash
fractary-core repo push
fractary-core repo push --set-upstream
fractary-core repo push --remote upstream
```

| Flag | Description |
|------|-------------|
| `--remote <name>` | Remote name (default: `origin`) |
| `--set-upstream` | Set upstream branch |
| `--force` | Force push (use with caution) |
| `--json` | Output as JSON |

#### Push: MCP

Tool: `fractary_repo_push`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `branch` | string | No | Branch to push |
| `remote` | string | No | Remote name |
| `force` | boolean | No | Force push |
| `set_upstream` | boolean | No | Set upstream tracking |

---

### Pull

#### Pull: SDK

```typescript
repoManager.pull({ rebase: true });
```

#### Pull: CLI

```bash
fractary-core repo pull
fractary-core repo pull --rebase
```

| Flag | Description |
|------|-------------|
| `--remote <name>` | Remote name (default: `origin`) |
| `--rebase` | Rebase instead of merge |
| `--json` | Output as JSON |

#### Pull: MCP

Tool: `fractary_repo_pull`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `branch` | string | No | Branch to pull |
| `remote` | string | No | Remote name |
| `rebase` | boolean | No | Use rebase |

#### Pull: Plugin

Command: `/fractary-repo-pull`

| Argument | Required | Description |
|----------|----------|-------------|
| `--rebase` | No | Rebase instead of merge |
| `--remote <name>` | No | Remote name |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI (`fractary-core repo pull`). No agent delegation.

---

## Pull Request Operations

### Quick Reference

| Operation | SDK | CLI | MCP | Plugin |
|-----------|-----|-----|-----|--------|
| [Create PR](#create-pr) | [`createPR(opts)`](#create-pr-sdk) | [`pr-create`](#create-pr-cli) | [`pr_create`](#create-pr-mcp) | [`/pr-create`](#create-pr-plugin) |
| [Merge PR](#merge-pr) | [`mergePR(n, opts)`](#merge-pr-sdk) | [`pr-merge`](#merge-pr-cli) | [`pr_merge`](#merge-pr-mcp) | [`/pr-merge`](#merge-pr-plugin) |
| [Review PR](#review-pr) | [`reviewPR(n, opts)`](#review-pr-sdk) | [`pr-review`](#review-pr-cli) | [`pr_review`](#review-pr-mcp) | [`/pr-review`](#review-pr-plugin) |
| [List PRs](#list-prs) | [`listPRs(opts)`](#list-prs-sdk) | [`pr-list`](#list-prs-cli) | [`pr_list`](#list-prs-mcp) | - |
| [Get PR](#get-pr) | [`getPR(n)`](#get-pr-sdk) | - | [`pr_get`](#get-pr-mcp) | - |

---

### Create PR

Create a pull request.

#### Create PR: SDK

```typescript
const pr = await repoManager.createPR({
  title: 'Add authentication system',
  body: 'Implements JWT authentication',
  base: 'main',
  draft: false
});
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | Yes | PR title |
| `body` | string | No | PR description |
| `base` | string | No | Target branch |
| `head` | string | No | Source branch (default: current) |
| `draft` | boolean | No | Create as draft |

**Returns:** `Promise<PullRequest>`

#### Create PR: CLI

```bash
fractary-core repo pr-create --title "Add auth" --body "Implements JWT"
fractary-core repo pr-create --title "WIP: New feature" --draft
```

| Flag | Description |
|------|-------------|
| `--title <title>` | PR title (required) |
| `--body <body>` | PR description |
| `--base <branch>` | Base branch (default: main) |
| `--head <branch>` | Head branch (default: current) |
| `--draft` | Create as draft |
| `--json` | Output as JSON |

#### Create PR: MCP

Tool: `fractary_repo_pr_create`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | Yes | PR title |
| `body` | string | No | PR description |
| `base` | string | No | Base branch |
| `head` | string | No | Head branch |
| `draft` | boolean | No | Create as draft |

#### Create PR: Plugin

Command: `/fractary-repo-pr-create`

| Argument | Required | Description |
|----------|----------|-------------|
| `--title <title>` | No | PR title (generated if omitted) |
| `--body <body>` | No | PR description (generated from commits if omitted) |
| `--work-id <id>` | No | Work item to link (adds `Closes #id`) |
| `--draft` | No | Create as draft |
| `--base <branch>` | No | Base branch |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI (`fractary-core repo pr-create`). No agent delegation. The plugin generates title and body from commit history if not provided.

---

### Merge PR

Merge a pull request.

#### Merge PR: SDK

```typescript
const merged = await repoManager.mergePR(42, { method: 'squash' });
```

#### Merge PR: CLI

```bash
fractary-core repo pr-merge 42
fractary-core repo pr-merge 42 --strategy squash --delete-branch
```

| Flag | Description |
|------|-------------|
| `--strategy <strategy>` | `merge`, `squash`, or `rebase` (default: config or `merge`) |
| `--delete-branch` | Delete branch after merge |
| `--json` | Output as JSON |

#### Merge PR: MCP

Tool: `fractary_repo_pr_merge`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `number` | number | Yes | PR number |
| `strategy` | string | No | `merge`, `squash`, `rebase` |
| `delete_branch` | boolean | No | Delete branch after merge |

#### Merge PR: Plugin

Command: `/fractary-repo-pr-merge`

| Argument | Required | Description |
|----------|----------|-------------|
| `<pr_number>` | Yes | PR number to merge |
| `--strategy <merge\|squash\|rebase>` | No | Merge strategy (default: `squash`) |
| `--delete-branch` | No | Delete branch after merge |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI (`fractary-core repo pr-merge`). No agent delegation.

---

### Review PR

Analyze and review a pull request.

#### Review PR: SDK

```typescript
await repoManager.reviewPR(42, { action: 'approve', comment: 'LGTM!' });
await repoManager.approvePR(42, 'Looks good');
await repoManager.requestReview(42, ['reviewer1']);
```

#### Review PR: CLI

```bash
fractary-core repo pr-review 42 --approve
fractary-core repo pr-review 42 --request-changes --comment "Add tests"
```

| Flag | Description |
|------|-------------|
| `--approve` | Approve the PR |
| `--request-changes` | Request changes |
| `--comment <text>` | Review comment |
| `--json` | Output as JSON |

#### Review PR: MCP

Tools: `fractary_repo_pr_review`, `fractary_repo_pr_approve`, `fractary_repo_pr_request_review`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `number` | number | Yes | PR number |
| `action` | string | Yes | `approve`, `request_changes`, `comment` |
| `comment` | string | No | Review comment |

#### Review PR: Plugin

Command: `/fractary-repo-pr-review`

| Argument | Required | Description |
|----------|----------|-------------|
| `<pr_number>` | Yes | PR number to review |
| `--approve` | No | Approve the PR |
| `--request-changes` | No | Request changes |
| `--comment` | No | Add review comment |
| `--body <text>` | No | Review body text |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Delegates to **`fractary-repo-pr-review-agent`**. The agent comprehensively analyzes PRs including comments, reviews, CI status, and merge conflicts, then provides intelligent recommendations on whether to approve.

---

### List PRs

#### List PRs: SDK

```typescript
const prs = await repoManager.listPRs({ state: 'open' });
```

#### List PRs: CLI

```bash
fractary-core repo pr-list
fractary-core repo pr-list --state all --author myuser --json
```

| Flag | Description |
|------|-------------|
| `--state <state>` | `open`, `closed`, or `all` (default: `open`) |
| `--author <user>` | Filter by author |
| `--limit <n>` | Max results (default: 10) |
| `--json` | Output as JSON |

#### List PRs: MCP

Tool: `fractary_repo_pr_list`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `state` | string | No | `open`, `closed`, `all` |
| `author` | string | No | Filter by author |
| `limit` | number | No | Max results |

---

### Get PR

#### Get PR: SDK

```typescript
const pr = await repoManager.getPR(42);
```

#### Get PR: MCP

Tool: `fractary_repo_pr_get` with `{ "number": 42 }`

---

## Compound Workflows

These plugin-only commands orchestrate multiple operations in sequence.

### Commit + Push

Command: `/fractary-repo-commit-push`

Commits all changes and pushes to remote. Creates a feature branch if on main.

| Argument | Required | Description |
|----------|----------|-------------|
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI. Orchestrates `branch-create` (if needed), `commit`, and `push`.

### Commit + Push + PR

Command: `/fractary-repo-commit-push-pr`

Commits, pushes, and creates a pull request. Creates a feature branch if on main.

| Argument | Required | Description |
|----------|----------|-------------|
| `--work-id <id>` | No | Work item to link (adds `Closes #id` to PR body) |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI. Orchestrates `branch-create` (if needed), `commit`, `push`, and `pr-create`.

### Commit + Push + PR + Review

Command: `/fractary-repo-commit-push-pr-review`

Commits, pushes, creates a PR, waits for CI, then runs a comprehensive PR review.

| Argument | Required | Description |
|----------|----------|-------------|
| `--work-id <id>` | No | Work item to link |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Steps 1-6 execute via CLI. Step 7 delegates to **`fractary-repo-pr-review-agent`** for comprehensive analysis.

### Commit + Push + PR + Merge

Command: `/fractary-repo-commit-push-pr-merge`

Full workflow: commits, pushes, creates a PR, merges, and cleans up the branch.

| Argument | Required | Description |
|----------|----------|-------------|
| `--work-id <id>` | No | Work item to link |
| `--squash` / `--merge` / `--rebase` | No | Merge strategy (default: `squash`) |
| `--skip-ci` | No | Skip CI wait |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI. Orchestrates `branch-create`, `commit`, `push`, `pr-create`, and `pr-merge`.

---

## Tag Operations

### Quick Reference

| Operation | SDK | CLI | MCP | Plugin |
|-----------|-----|-----|-----|--------|
| [Create](#create-tag) | [`createTag(name, opts)`](#create-tag-sdk) | [`tag-create`](#create-tag-cli) | [`tag_create`](#create-tag-mcp) | - |
| [Delete](#delete-tag) | [`deleteTag(name)`](#delete-tag-sdk) | - | [`tag_delete`](#delete-tag-mcp) | - |
| [Push](#push-tag) | [`pushTag(name)`](#push-tag-sdk) | [`tag-push`](#push-tag-cli) | [`tag_push`](#push-tag-mcp) | - |
| [List](#list-tags) | [`listTags(opts)`](#list-tags-sdk) | [`tag-list`](#list-tags-cli) | [`tag_list`](#list-tags-mcp) | - |

---

### Create Tag

#### Create Tag: SDK

```typescript
repoManager.createTag('v1.0.0', { message: 'Release v1.0.0', annotate: true });
```

#### Create Tag: CLI

```bash
fractary-core repo tag-create v1.0.0
fractary-core repo tag-create v1.0.0 --message "Release v1.0.0" --sign
```

| Flag | Description |
|------|-------------|
| `--message <msg>` | Tag message (creates annotated tag) |
| `--sign` | GPG-signed tag |
| `--force` | Replace existing tag |
| `--json` | Output as JSON |

#### Create Tag: MCP

Tool: `fractary_repo_tag_create`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Tag name |
| `message` | string | No | Tag message |
| `commit` | string | No | Commit to tag (default: HEAD) |

---

### Delete Tag

#### Delete Tag: SDK

```typescript
repoManager.deleteTag('v0.9.0-beta');
```

#### Delete Tag: MCP

Tool: `fractary_repo_tag_delete` with `{ "name": "v0.9.0-beta" }`

---

### Push Tag

#### Push Tag: SDK

```typescript
repoManager.pushTag('v1.0.0');
```

#### Push Tag: CLI

```bash
fractary-core repo tag-push v1.0.0
fractary-core repo tag-push all  # push all tags
```

#### Push Tag: MCP

Tool: `fractary_repo_tag_push` with `{ "name": "v1.0.0" }`

---

### List Tags

#### List Tags: SDK

```typescript
const tags = repoManager.listTags({ pattern: 'v1.*' });
```

#### List Tags: CLI

```bash
fractary-core repo tag-list
fractary-core repo tag-list --pattern "v*" --latest 5
```

#### List Tags: MCP

Tool: `fractary_repo_tag_list` with optional `{ "pattern": "v1.*", "latest": 5 }`

---

## Worktree Operations

### Quick Reference

| Operation | SDK | CLI | MCP | Plugin |
|-----------|-----|-----|-----|--------|
| [Create](#create-worktree) | [`createWorktree(opts)`](#create-worktree-sdk) | [`worktree-create`](#create-worktree-cli) | [`worktree_create`](#create-worktree-mcp) | [`/worktree-create`](#create-worktree-plugin) |
| [List](#list-worktrees) | [`listWorktrees()`](#list-worktrees-sdk) | [`worktree-list`](#list-worktrees-cli) | [`worktree_list`](#list-worktrees-mcp) | [`/worktree-list`](#list-worktrees-plugin) |
| [Remove](#remove-worktree) | [`removeWorktree(path)`](#remove-worktree-sdk) | [`worktree-remove`](#remove-worktree-cli) | [`worktree_remove`](#remove-worktree-mcp) | [`/worktree-remove`](#remove-worktree-plugin) |
| [Cleanup](#cleanup-worktrees) | [`cleanupWorktrees(opts)`](#cleanup-worktrees-sdk) | [`worktree-cleanup`](#cleanup-worktrees-cli) | [`worktree_cleanup`](#cleanup-worktrees-mcp) | [`/worktree-cleanup`](#cleanup-worktrees-plugin) |

---

### Create Worktree

#### Create Worktree: SDK

```typescript
const worktree = repoManager.createWorktree({
  path: '../myrepo-feature',
  branch: 'feature/parallel-work',
  baseBranch: 'main'
});
```

#### Create Worktree: CLI

```bash
fractary-core repo worktree-create feature/auth
fractary-core repo worktree-create feature/auth --path ../myrepo-auth --base develop
fractary-core repo worktree-create feature/fix --work-id 123
```

| Flag | Description |
|------|-------------|
| `--path <path>` | Worktree path (default: auto from config) |
| `--work-id <id>` | Work item ID |
| `--base <branch>` | Base branch |
| `--no-checkout` | Skip file checkout |
| `--json` | Output as JSON |

#### Create Worktree: MCP

Tool: `fractary_repo_worktree_create`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | Yes | Worktree path |
| `branch` | string | Yes | Branch name |
| `base_branch` | string | No | Base branch |

#### Create Worktree: Plugin

Command: `/fractary-repo-worktree-create`

| Argument | Required | Description |
|----------|----------|-------------|
| `<branch>` | Yes | Branch name |
| `--work-id <id>` | No | Work item ID |
| `--path <path>` | No | Custom worktree path |
| `--base <branch>` | No | Base branch |
| `--no-checkout` | No | Skip file checkout |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI (`fractary-core repo worktree-create`). No agent delegation.

---

### List Worktrees

#### List Worktrees: SDK

```typescript
const worktrees = repoManager.listWorktrees();
```

#### List Worktrees: CLI

```bash
fractary-core repo worktree-list
```

#### List Worktrees: MCP

Tool: `fractary_repo_worktree_list` (no parameters)

#### List Worktrees: Plugin

Command: `/fractary-repo-worktree-list`

**Delegation:** Executes directly via CLI. No agent delegation.

---

### Remove Worktree

#### Remove Worktree: SDK

```typescript
repoManager.removeWorktree('../myrepo-feature', true); // force
```

#### Remove Worktree: CLI

```bash
fractary-core repo worktree-remove .worktrees/feature/old --force
```

#### Remove Worktree: MCP

Tool: `fractary_repo_worktree_remove`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | Yes | Worktree path |
| `force` | boolean | No | Force removal |

#### Remove Worktree: Plugin

Command: `/fractary-repo-worktree-remove`

| Argument | Required | Description |
|----------|----------|-------------|
| `<path>` | Yes | Worktree path |
| `--force` | No | Force removal |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI. No agent delegation.

---

### Cleanup Worktrees

#### Cleanup Worktrees: SDK

```typescript
const result = await repoManager.cleanupWorktrees({ dryRun: false });
```

#### Cleanup Worktrees: CLI

```bash
fractary-core repo worktree-cleanup --dry-run
fractary-core repo worktree-cleanup --merged
```

| Flag | Description |
|------|-------------|
| `--merged` | Remove only merged worktrees |
| `--stale` | Remove only stale worktrees |
| `--dry-run` | Preview without removing |
| `--json` | Output as JSON |

#### Cleanup Worktrees: MCP

Tool: `fractary_repo_worktree_cleanup`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `merged` | boolean | No | Only merged worktrees |
| `force` | boolean | No | Force cleanup |
| `delete_branch` | boolean | No | Delete associated branches |

#### Cleanup Worktrees: Plugin

Command: `/fractary-repo-worktree-cleanup`

| Argument | Required | Description |
|----------|----------|-------------|
| `--dry-run` | No | Preview without removing |
| `--merged` | No | Only merged worktrees |
| `--stale` | No | Only stale worktrees |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI. No agent delegation.

---

## Status & Info

These operations provide repository state information.

### Quick Reference

| Operation | SDK | CLI | MCP |
|-----------|-----|-----|-----|
| Status | `repoManager.getStatus()` | `repo status` | `fractary_repo_status` |
| Current branch | `repoManager.getCurrentBranch()` | - | `fractary_repo_branch_current` |
| Is dirty | `repoManager.isDirty()` | - | `fractary_repo_is_dirty` |
| Diff | `repoManager.getDiff(opts)` | - | `fractary_repo_diff` |

### Status: CLI

```bash
fractary-core repo status
fractary-core repo status --json
```

### Diff: MCP

Tool: `fractary_repo_diff`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `staged` | boolean | No | Show only staged changes |
| `base` | string | No | Base branch/commit |
| `head` | string | No | Head branch/commit |

---

## Skills

### fractary-repo-pr-reviewer

Comprehensively analyzes pull requests including comments, reviews, CI status, and merge conflicts. Provides intelligent recommendations on whether to approve based on blocking conditions.

**Invoked by:** `/fractary-repo-pr-review` command, and step 7 of `/fractary-repo-commit-push-pr-review`

**Triggers proactively:** "review this PR", "analyze PR #123"

---

## Types & Schemas

```typescript
interface Branch {
  name: string;
  sha: string;
  isDefault: boolean;
  isProtected: boolean;
  upstream?: string;
}

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
  parents: string[];
}

type CommitType = 'feat' | 'fix' | 'chore' | 'docs' | 'style' | 'refactor' | 'perf' | 'test';

interface PullRequest {
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed' | 'merged';
  head: string;
  base: string;
  author: string;
  url: string;
  draft: boolean;
  mergeable?: boolean;
}

interface Tag {
  name: string;
  sha: string;
  message?: string;
  tagger?: string;
  date?: string;
}

interface Worktree {
  path: string;
  branch: string;
  sha: string;
  locked: boolean;
  prunable: boolean;
}
```

---

## Error Handling

### SDK Errors

```typescript
import { RepoError } from '@fractary/core';

try {
  await repoManager.createBranch('feature/test');
} catch (error) {
  if (error instanceof RepoError) {
    console.error('Repository error:', error.message);
  }
}
```

Error types: `BranchExistsError`, `BranchNotFoundError`, `ProtectedBranchError`, `CommitError`, `PushError`, `PRNotFoundError`, `PRError`, `MergeConflictError`, `DirtyWorkingDirectoryError`

### CLI Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | General error |
| `3` | Resource not found / validation failure |

### MCP Error Codes

| Code | Description |
|------|-------------|
| `NOT_FOUND` | Branch, PR, or resource not found |
| `UNAUTHORIZED` | Authentication failed |
| `FORBIDDEN` | Insufficient permissions / protected branch |
| `VALIDATION_ERROR` | Invalid parameters |
| `CONFLICT` | Merge conflict or dirty working directory |
| `RATE_LIMITED` | API rate limit exceeded |
