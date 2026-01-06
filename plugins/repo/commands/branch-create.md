---
name: fractary-repo:branch-create
allowed-tools: Bash(git branch:*), Bash(git rev-parse:*), Bash(git show-ref:*), Bash(git checkout:*)
description: Create a new git branch
model: claude-haiku-4-5
argument-hint: '<branch-name> [--from <base-branch>] [--format json]'
---

## Context

- Current branch: !`git branch --show-current`
- All branches: !`git branch -a | head -20`
- Repository root: !`git rev-parse --show-toplevel`

## Your task

Create a new git branch with validation and optional JSON output.

### Argument Parsing

Parse these arguments:
- `<branch-name>` (REQUIRED, positional): Branch name to create
- `--from <branch>` (OPTIONAL): Base branch (default: current branch)
- `--format <text|json>` (OPTIONAL): Output format (default: text)

Extract branch name as the first non-flag argument. Extract `--from` value if present. Extract `--format` value if present.

### Implementation Steps

1. **Validate in git repository**:
```bash
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Error: Not in a git repository" >&2
  exit 1
fi
```

2. **Parse arguments**:
```bash
# Initialize variables
BRANCH_NAME=""
BASE_BRANCH=""
FORMAT="text"

# Parse arguments
while [ $# -gt 0 ]; do
  case "$1" in
    --from)
      BASE_BRANCH="$2"
      shift 2
      ;;
    --format)
      FORMAT="$2"
      shift 2
      ;;
    -*)
      echo "Error: Unknown option: $1" >&2
      exit 1
      ;;
    *)
      if [ -z "$BRANCH_NAME" ]; then
        BRANCH_NAME="$1"
      else
        echo "Error: Unexpected argument: $1" >&2
        exit 1
      fi
      shift
      ;;
  esac
done

# Validate branch name provided
if [ -z "$BRANCH_NAME" ]; then
  echo "Error: Branch name is required" >&2
  echo "Usage: /fractary-repo:branch-create <branch-name> [--from <base>] [--format json]" >&2
  exit 1
fi
```

3. **Validate branch name**:
```bash
if echo "$BRANCH_NAME" | grep -qE '[[:space:]~^:?*\[]'; then
  echo "Error: Invalid branch name (contains invalid characters)" >&2
  echo "Branch names cannot contain: spaces, ~, ^, :, ?, *, [, ]" >&2
  exit 2
fi
```

4. **Check branch doesn't exist**:
```bash
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
  echo "Error: Branch '$BRANCH_NAME' already exists" >&2
  echo "" >&2
  echo "To switch to this branch:" >&2
  echo "  git checkout $BRANCH_NAME" >&2
  exit 3
fi
```

5. **Determine base branch** (if not specified):
```bash
if [ -z "$BASE_BRANCH" ]; then
  BASE_BRANCH=$(git branch --show-current)
  if [ -z "$BASE_BRANCH" ]; then
    # Detached HEAD, use HEAD
    BASE_BRANCH="HEAD"
  fi
fi
```

6. **Validate base branch exists** (if specified):
```bash
if ! git rev-parse --verify "$BASE_BRANCH" >/dev/null 2>&1; then
  echo "Error: Base branch '$BASE_BRANCH' not found" >&2
  exit 4
fi
```

7. **Create branch**:
```bash
if ! git branch "$BRANCH_NAME" "$BASE_BRANCH" 2>/dev/null; then
  echo "Error: Failed to create branch" >&2
  exit 5
fi
```

8. **Get commit information**:
```bash
COMMIT_SHA=$(git rev-parse "$BRANCH_NAME")
SHORT_SHA=$(echo "$COMMIT_SHA" | cut -c1-7)
```

9. **Output based on format**:

**Text format** (default):
```bash
if [ "$FORMAT" = "json" ]; then
  cat <<EOF
{
  "success": true,
  "branch": "$BRANCH_NAME",
  "base_branch": "$BASE_BRANCH",
  "commit": "$COMMIT_SHA",
  "short_commit": "$SHORT_SHA"
}
EOF
else
  echo "✓ Branch created: $BRANCH_NAME"
  echo "  Based on: $BASE_BRANCH"
  echo "  Commit: $SHORT_SHA"
  echo ""
  echo "To switch to this branch:"
  echo "  git checkout $BRANCH_NAME"
fi
```

### Error Handling

Exit codes:
- **0**: Success
- **1**: Not in git repository
- **2**: Invalid branch name
- **3**: Branch already exists
- **4**: Base branch not found
- **5**: Git command failed

All errors written to stderr with `>&2`.

### Security Notes

- Always quote variables in bash commands to prevent word splitting
- Validate branch name to prevent injection attacks
- Use git's built-in validation for branch names

### Example Execution

For command: `/fractary-repo:branch-create feature/258`

Expected output:
```
✓ Branch created: feature/258
  Based on: main
  Commit: abc123d

To switch to this branch:
  git checkout feature/258
```

For command: `/fractary-repo:branch-create feature/259 --from develop --format json`

Expected output:
```json
{
  "success": true,
  "branch": "feature/259",
  "base_branch": "develop",
  "commit": "def456abc789...",
  "short_commit": "def456a"
}
```
