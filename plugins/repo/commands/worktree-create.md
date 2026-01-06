---
name: fractary-repo:worktree-create
allowed-tools: Bash(git worktree:*), Bash(git rev-parse:*), Bash(git ls-remote:*), Bash(git symbolic-ref:*), Bash(git show-ref:*), Bash(git branch:*), Bash(git remote:*), Bash(cd:*), Bash(realpath:*), Bash(basename:*), Bash(dirname:*), Bash(mkdir:*)
description: Create a new git worktree for workflow execution
model: claude-haiku-4-5
argument-hint: '--work-id <id> --branch <name> [--path <path>] [--base <branch>] [--no-checkout] [--format json]'
---

## Context

- Git repository root: !`git rev-parse --show-toplevel 2>/dev/null || echo "Not in git repository"`
- Current branch: !`git branch --show-current 2>/dev/null || echo "unknown"`
- Remote branches: !`git branch -r 2>/dev/null | head -10`

## Your task

Create a new git worktree with validation and error handling.

### Argument Parsing

Parse these arguments from the command line:
- `--work-id <id>` (REQUIRED): Work item identifier
- `--branch <name>` (REQUIRED): Branch name for worktree
- `--path <path>` (OPTIONAL): Custom worktree path
- `--base <branch>` (OPTIONAL): Base branch to create from
- `--no-checkout` (OPTIONAL): Skip checking out files
- `--format <text|json>` (OPTIONAL): Output format (default: text)

Extract the arguments by parsing the input string. Look for patterns like `--work-id 123` and `--branch feature/name`.

### Implementation Steps

1. **Validate in git repository**:
```bash
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Error: Not in a git repository" >&2
  exit 1
fi
```

2. **Validate work-id parameter**:
```bash
# Ensure work-id contains only safe characters (alphanumeric, hyphen, underscore)
if ! echo "$WORK_ID" | grep -qE '^[a-zA-Z0-9_-]+$'; then
  echo "Error: Invalid work-id '$WORK_ID'" >&2
  echo "Work-id must contain only letters, numbers, hyphens, and underscores" >&2
  exit 4
fi
```

3. **Extract organization from git remote**:
```bash
# Get remote URL
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")

# Extract organization from URL
if echo "$REMOTE_URL" | grep -qE '^git@'; then
  # SSH format: git@github.com:org/project.git
  ORGANIZATION=$(echo "$REMOTE_URL" | sed -E 's/^git@[^:]+:([^/]+)\/.*/\1/')
elif echo "$REMOTE_URL" | grep -qE '^https?://'; then
  # HTTPS format: https://github.com/org/project.git
  ORGANIZATION=$(echo "$REMOTE_URL" | sed -E 's|^https?://[^/]+/([^/]+)/.*|\1|')
else
  ORGANIZATION="local"
fi

# Get project name
PROJECT_NAME=$(basename "$(git rev-parse --show-toplevel)")
```

4. **Generate worktree path** (if not provided):
```bash
if [ -z "$WORKTREE_PATH" ]; then
  # Use SPEC-00030 pattern: ~/.claude-worktrees/{org}-{project}-{id}
  BASE_DIR="${HOME}/.claude-worktrees"
  mkdir -p "$BASE_DIR" 2>/dev/null || {
    echo "Error: Cannot create worktrees directory: $BASE_DIR" >&2
    exit 7
  }

  WORKTREE_PATH="${BASE_DIR}/${ORGANIZATION}-${PROJECT_NAME}-${WORK_ID}"
fi
```

5. **Validate path doesn't exist**:
```bash
if [ -e "$WORKTREE_PATH" ]; then
  echo "Error: Path already exists: $WORKTREE_PATH" >&2
  echo "" >&2
  echo "To remove existing worktree:" >&2
  echo "  /fractary-repo:worktree-remove $WORKTREE_PATH" >&2
  exit 2
fi
```

6. **Validate branch name**:
```bash
# Check for invalid characters (spaces, special git characters)
if echo "$BRANCH" | grep -qE '[[:space:]~^:?*\[]'; then
  echo "Error: Invalid branch name: $BRANCH" >&2
  echo "Branch names cannot contain spaces or special characters: ~ ^ : ? * [" >&2
  exit 4
fi
```

7. **Detect base branch** (if not specified):
```bash
if [ -z "$BASE_BRANCH" ]; then
  # Try to detect main/master from remote HEAD
  BASE_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')

  # Fallback to current branch
  if [ -z "$BASE_BRANCH" ]; then
    BASE_BRANCH=$(git branch --show-current)
  fi
fi
```

8. **Verify base branch exists** (if specified by user):
```bash
if [ -n "$BASE_BRANCH" ]; then
  if ! git rev-parse --verify "$BASE_BRANCH" >/dev/null 2>&1; then
    echo "Error: Base branch '$BASE_BRANCH' not found" >&2
    exit 5
  fi
fi
```

9. **Create worktree with branch logic**:
```bash
# Check if branch exists remotely
if git ls-remote --heads origin "$BRANCH" 2>/dev/null | grep -qF "refs/heads/$BRANCH"; then
  # Branch exists remotely - check it out
  echo "Branch '$BRANCH' exists on remote, checking it out..."

  if [ "$NO_CHECKOUT" = "true" ]; then
    git worktree add --no-checkout "$WORKTREE_PATH" "$BRANCH"
  else
    git worktree add "$WORKTREE_PATH" "$BRANCH"
  fi
else
  # Check if branch exists locally (error - conflicts)
  if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
    echo "Error: Branch '$BRANCH' already exists locally" >&2
    echo "Use a different branch name or remove the existing worktree first" >&2
    exit 3
  fi

  # Create new branch from base
  echo "Creating new branch '$BRANCH' from '$BASE_BRANCH'..."

  if [ "$NO_CHECKOUT" = "true" ]; then
    git worktree add --no-checkout -b "$BRANCH" "$WORKTREE_PATH" "$BASE_BRANCH"
  else
    git worktree add -b "$BRANCH" "$WORKTREE_PATH" "$BASE_BRANCH"
  fi
fi
```

10. **Change to worktree directory**:
```bash
cd "$WORKTREE_PATH" || {
  echo "Error: Failed to change directory to worktree" >&2
  exit 6
}
```

11. **Output based on format**:
```bash
ABSOLUTE_PATH=$(realpath "$WORKTREE_PATH")

if [ "$FORMAT" = "json" ]; then
  cat <<EOF
{
  "success": true,
  "path": "$WORKTREE_PATH",
  "absolute_path": "$ABSOLUTE_PATH",
  "branch": "$BRANCH",
  "base_branch": "$BASE_BRANCH",
  "organization": "$ORGANIZATION",
  "project": "$PROJECT_NAME",
  "work_id": "$WORK_ID"
}
EOF
else
  echo "✓ Worktree created: $WORKTREE_PATH"
  echo "✓ Branch: $BRANCH"
  echo "✓ Based on: $BASE_BRANCH"
  echo "✓ Current directory: $ABSOLUTE_PATH"
fi
```

### Error Handling

Use these exit codes consistently:
- **1**: Not in git repository
- **2**: Path already exists
- **3**: Branch exists locally
- **4**: Invalid branch name
- **5**: Base branch not found
- **6**: Git worktree command failed
- **7**: Permission denied

Always write errors to stderr using `>&2` and provide actionable guidance.

### Security Notes

- Always quote variables in bash: `"$VARIABLE"`
- Validate paths to prevent traversal: reject paths with `..` components
- Sanitize branch names before using in commands

### Example Execution

For command: `/fractary-repo:worktree-create --work-id 258 --branch feature/258`

Expected output:
```
Branch 'feature/258' doesn't exist, creating from 'main'...
✓ Worktree created: ../core-258
✓ Branch: feature/258
✓ Based on: main
✓ Current directory: /mnt/c/GitHub/fractary/core-258
```
