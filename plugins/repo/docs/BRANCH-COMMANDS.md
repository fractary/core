# Fractary-Repo Branch Commands

## Overview

Branch management commands for creating and managing git branches with validation and structured output.

## Commands

### /fractary-repo:branch-create

Create a new git branch with validation and optional JSON output.

#### Usage

```bash
/fractary-repo:branch-create <branch-name> [OPTIONS]
```

#### Parameters

- `<branch-name>` (REQUIRED): Name of the branch to create
- `--from <branch>` (OPTIONAL): Base branch to create from (default: current branch)
- `--format <format>` (OPTIONAL): Output format - `text` or `json` (default: `text`)

#### Examples

**Create from current branch**:
```bash
/fractary-repo:branch-create feature/258
```

Output:
```
✓ Branch created: feature/258
  Based on: main
  Commit: abc123d

To switch to this branch:
  git checkout feature/258
```

**Create from specific base**:
```bash
/fractary-repo:branch-create feature/259 --from develop
```

**JSON output**:
```bash
/fractary-repo:branch-create feature/260 --format json
```

Output:
```json
{
  "success": true,
  "branch": "feature/260",
  "base_branch": "main",
  "commit": "abc123def456789...",
  "short_commit": "abc123d"
}
```

#### Error Handling

| Exit Code | Description |
|-----------|-------------|
| 0 | Success |
| 1 | Not in a git repository |
| 2 | Invalid branch name |
| 3 | Branch already exists |
| 4 | Base branch not found |
| 5 | Git command failed |

**Branch Naming Rules**:
- Cannot contain: spaces, `~`, `^`, `:`, `?`, `*`, `[`, `]`
- Must be a valid git reference name
- Common patterns: `feature/description`, `fix/issue-123`, `release/v1.0`

#### Common Workflows

**Feature branch from main**:
```bash
# Create and switch to new feature branch
/fractary-repo:branch-create feature/new-dashboard --from main
git checkout feature/new-dashboard
```

**Bugfix branch**:
```bash
/fractary-repo:branch-create fix/login-error --from main
```

**Release branch**:
```bash
/fractary-repo:branch-create release/v2.5.0 --from develop
```

## Integration with Other Commands

### Create Branch + Worktree

Combine branch creation with worktree creation:

```bash
# Create branch
/fractary-repo:branch-create feature/258

# Create worktree for the branch
/fractary-repo:worktree-create --work-id 258 --branch feature/258
```

### Programmatic Usage (SDK)

```typescript
import { RepoManager } from '@fractary/sdk/repo';

const repoManager = new RepoManager(process.cwd());

// Create branch
const result = await repoManager.createBranch('feature/258', {
  baseBranch: 'main'
});

console.log(`Created ${result.name} at ${result.sha}`);
```

## Troubleshooting

### Error: Branch already exists

**Problem**: The branch name is already in use.

**Solution**:
```bash
# Switch to existing branch
git checkout feature/258

# Or use a different name
/fractary-repo:branch-create feature/258-v2
```

### Error: Base branch not found

**Problem**: The specified base branch doesn't exist.

**Solution**:
```bash
# List available branches
git branch -a

# Use correct branch name
/fractary-repo:branch-create feature/258 --from origin/main
```

### Error: Invalid branch name

**Problem**: Branch name contains invalid characters.

**Solution**: Use alphanumeric characters, hyphens, and slashes only:
```bash
# Bad: contains spaces
/fractary-repo:branch-create "feature new dashboard"

# Good: uses hyphens
/fractary-repo:branch-create feature/new-dashboard
```

## Best Practices

1. **Use semantic prefixes**: `feature/`, `fix/`, `chore/`, `docs/`
2. **Include issue numbers**: `feature/123-add-login`
3. **Keep names concise**: Aim for < 50 characters
4. **Use lowercase**: Avoid uppercase for consistency
5. **Hyphenate multi-word descriptions**: `new-user-dashboard` not `new_user_dashboard`

## Related Commands

- `/fractary-repo:worktree-create` - Create a worktree for isolated development
- `/fractary-repo:pr-create` - Create a pull request from a branch
- `/fractary-repo:commit` - Commit changes to a branch
