# Repo Toolset - MCP Tools Reference

MCP tools reference for the Repo toolset. 38 tools for repository and Git operations.

## Tool Naming Convention

```
fractary_repo_{resource}_{action}
```

## Branch Tools

### fractary_repo_branch_create

Create a new branch.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Branch name |
| `base` | string | No | Base branch (default: main) |
| `checkout` | boolean | No | Checkout after creation |

**Example:**
```json
{
  "name": "feature/auth",
  "base": "develop",
  "checkout": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "feature/auth",
    "sha": "abc123...",
    "isDefault": false
  }
}
```

### fractary_repo_branch_delete

Delete a branch.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Branch name |
| `force` | boolean | No | Force delete unmerged |
| `remote` | boolean | No | Delete remote branch |

### fractary_repo_branch_list

List branches.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `remote` | boolean | No | Include remote branches |
| `merged` | boolean | No | Only merged branches |

### fractary_repo_branch_generate_name

Generate a semantic branch name.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | Branch type: `feature`, `bugfix`, `hotfix`, `release` |
| `description` | string | Yes | Brief description |
| `workId` | string | No | Work item ID |

**Example:**
```json
{
  "type": "feature",
  "description": "user authentication",
  "workId": "123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "feature/123-user-authentication"
  }
}
```

## Commit Tools

### fractary_repo_commit

Create a commit.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | string | Yes | Commit message |
| `type` | string | No | Conventional type: `feat`, `fix`, `chore`, etc. |
| `scope` | string | No | Commit scope |
| `breaking` | boolean | No | Breaking change |
| `body` | string | No | Extended description |
| `files` | string[] | No | Files to stage |

**Example:**
```json
{
  "message": "Add JWT authentication",
  "type": "feat",
  "scope": "auth",
  "files": ["src/auth.ts", "tests/auth.test.ts"]
}
```

### fractary_repo_stage

Stage files for commit.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `patterns` | string[] | Yes | File patterns to stage |

### fractary_repo_stage_all

Stage all changes.

**Parameters:** None

### fractary_repo_push

Push to remote.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `remote` | string | No | Remote name |
| `branch` | string | No | Branch name |
| `force` | boolean | No | Force push |
| `setUpstream` | boolean | No | Set upstream tracking |

### fractary_repo_pull

Pull from remote.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `remote` | string | No | Remote name |
| `branch` | string | No | Branch name |
| `rebase` | boolean | No | Rebase instead of merge |

## Pull Request Tools

### fractary_repo_pr_create

Create a pull request.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | Yes | PR title |
| `body` | string | No | PR description |
| `base` | string | No | Target branch |
| `head` | string | No | Source branch |
| `draft` | boolean | No | Create as draft |

**Example:**
```json
{
  "title": "Add authentication system",
  "body": "Implements JWT authentication\n\n## Changes\n- Add auth middleware\n- Add login endpoint",
  "base": "main",
  "draft": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "number": 42,
    "title": "Add authentication system",
    "state": "open",
    "url": "https://github.com/myorg/myrepo/pull/42"
  }
}
```

### fractary_repo_pr_merge

Merge a pull request.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `number` | number | Yes | PR number |
| `method` | string | No | Merge method: `merge`, `squash`, `rebase` |
| `deleteBranch` | boolean | No | Delete branch after merge |

### fractary_repo_pr_list

List pull requests.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `state` | string | No | Filter: `open`, `closed`, `all` |
| `author` | string | No | Filter by author |

### fractary_repo_pr_get

Get pull request details.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `number` | number | Yes | PR number |

### fractary_repo_pr_review

Get PR review information.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `number` | number | Yes | PR number |

## Tag Tools

### fractary_repo_tag_create

Create a tag.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Tag name |
| `message` | string | No | Tag message (annotated) |
| `sha` | string | No | Commit to tag |

### fractary_repo_tag_delete

Delete a tag.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Tag name |
| `remote` | boolean | No | Delete from remote |

### fractary_repo_tag_push

Push a tag to remote.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Tag name |
| `remote` | string | No | Remote name |

### fractary_repo_tag_list

List tags.

**Parameters:** None

## Worktree Tools

### fractary_repo_worktree_create

Create a git worktree.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | Yes | Worktree path |
| `branch` | string | Yes | Branch to checkout |
| `createBranch` | boolean | No | Create branch if doesn't exist |

### fractary_repo_worktree_list

List worktrees.

**Parameters:** None

### fractary_repo_worktree_remove

Remove a worktree.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | Yes | Worktree path |
| `force` | boolean | No | Force remove |

### fractary_repo_worktree_prune

Clean up stale worktrees.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `dryRun` | boolean | No | Preview only |

## Status Tools

### fractary_repo_status

Get repository status.

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "branch": "feature/auth",
    "ahead": 2,
    "behind": 0,
    "staged": ["src/auth.ts"],
    "modified": ["README.md"],
    "untracked": ["temp.txt"]
  }
}
```

### fractary_repo_log

Get commit log.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | No | Number of commits |
| `branch` | string | No | Branch to show |

## Tool Summary

| Tool | Description |
|------|-------------|
| `fractary_repo_branch_create` | Create branch |
| `fractary_repo_branch_delete` | Delete branch |
| `fractary_repo_branch_list` | List branches |
| `fractary_repo_branch_generate_name` | Generate branch name |
| `fractary_repo_commit` | Create commit |
| `fractary_repo_stage` | Stage files |
| `fractary_repo_stage_all` | Stage all changes |
| `fractary_repo_push` | Push to remote |
| `fractary_repo_pull` | Pull from remote |
| `fractary_repo_pr_create` | Create PR |
| `fractary_repo_pr_merge` | Merge PR |
| `fractary_repo_pr_list` | List PRs |
| `fractary_repo_pr_get` | Get PR details |
| `fractary_repo_pr_review` | Get PR reviews |
| `fractary_repo_tag_create` | Create tag |
| `fractary_repo_tag_delete` | Delete tag |
| `fractary_repo_tag_push` | Push tag |
| `fractary_repo_tag_list` | List tags |
| `fractary_repo_worktree_create` | Create worktree |
| `fractary_repo_worktree_list` | List worktrees |
| `fractary_repo_worktree_remove` | Remove worktree |
| `fractary_repo_worktree_prune` | Prune worktrees |
| `fractary_repo_status` | Get status |
| `fractary_repo_log` | Get commit log |

## Other Interfaces

- **SDK:** [Repo API](/docs/sdk/repo.md)
- **CLI:** [Repo Commands](/docs/cli/repo.md)
- **Plugin:** [Repo Plugin](/docs/plugins/repo.md)
