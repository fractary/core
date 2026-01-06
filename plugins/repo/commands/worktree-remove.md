---
name: fractary-repo:worktree-remove
allowed-tools: Bash(git worktree:*), Bash(git diff-index:*), Bash(git log:*), Bash(git rev-parse:*), Bash(cd:*), Bash(realpath:*), AskUserQuestion
description: Safely remove a git worktree
model: claude-haiku-4-5
argument-hint: '<path> [--force]'
---

## Context

- Current worktree: !`git rev-parse --show-toplevel 2>/dev/null || echo "Not in git repository"`
- All worktrees: !`git worktree list 2>/dev/null`

## Your task

Safely remove a git worktree with validation and warnings.

### Argument Parsing

Parse these arguments:
- `<path>` (REQUIRED, positional): Path to worktree to remove
- `--force` (OPTIONAL, flag): Skip uncommitted changes check

The path is the first argument that doesn't start with `--`. Look for `--force` flag anywhere in the arguments.

### Implementation Steps

1. **Validate in git repository**:
```bash
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Error: Not in a git repository" >&2
  exit 1
fi
```

2. **Normalize worktree path**:
```bash
# Convert to absolute path for comparison
WORKTREE_PATH=$(realpath "$INPUT_PATH" 2>/dev/null || echo "$INPUT_PATH")
```

3. **Validate worktree exists**:
```bash
if ! git worktree list | grep -qF "$WORKTREE_PATH"; then
  # Try the original input path too
  if ! git worktree list | grep -qF "$INPUT_PATH"; then
    echo "Error: Not a git worktree: $INPUT_PATH" >&2
    echo "" >&2
    echo "To list all worktrees:" >&2
    echo "  /fractary-repo:worktree-list" >&2
    exit 2
  fi
  # Use the original path if it matched
  WORKTREE_PATH="$INPUT_PATH"
fi
```

4. **Check if it's the main worktree**:
```bash
# Main worktree is always the first in the list
MAIN_WORKTREE=$(git worktree list | head -1 | awk '{print $1}')

if [ "$WORKTREE_PATH" = "$MAIN_WORKTREE" ]; then
  echo "Error: Cannot remove main worktree" >&2
  exit 5
fi
```

5. **Check if it's the current worktree**:
```bash
CURRENT=$(git rev-parse --show-toplevel 2>/dev/null)

if [ "$CURRENT" = "$WORKTREE_PATH" ]; then
  echo "Error: Cannot remove current worktree. Change directory first." >&2
  echo "" >&2
  echo "To switch to main worktree:" >&2
  echo "  cd $MAIN_WORKTREE" >&2
  exit 3
fi
```

6. **Check for uncommitted changes** (unless --force):
```bash
if [ "$FORCE" != "true" ]; then
  # Change to worktree and check status
  if [ -d "$WORKTREE_PATH" ]; then
    cd "$WORKTREE_PATH" 2>/dev/null || {
      echo "Error: Cannot access worktree directory" >&2
      exit 6
    }

    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
      echo "Error: Uncommitted changes in worktree. Commit or use --force" >&2
      echo "" >&2
      echo "To see changes:" >&2
      echo "  cd $WORKTREE_PATH && git status" >&2
      echo "" >&2
      echo "To force removal:" >&2
      echo "  /fractary-repo:worktree-remove $INPUT_PATH --force" >&2
      exit 4
    fi

    # Return to original directory
    cd - > /dev/null 2>&1 || true
  fi
fi
```

7. **Check for unpushed commits and warn**:
```bash
if [ -d "$WORKTREE_PATH" ]; then
  cd "$WORKTREE_PATH" 2>/dev/null || true

  # Check for unpushed commits
  UNPUSHED=$(git log --branches --not --remotes --oneline 2>/dev/null)

  if [ -n "$UNPUSHED" ]; then
    echo "" >&2
    echo "⚠️  Warning: Worktree has unpushed commits:" >&2
    echo "$UNPUSHED" >&2
    echo "" >&2

    # Use AskUserQuestion to confirm
    # The question should ask: "Continue removing worktree with unpushed commits?"
    # Options: "Yes, remove anyway" or "No, cancel removal"
    # If user selects cancel, exit 0
  fi

  cd - > /dev/null 2>&1 || true
fi
```

8. **Remove the worktree**:
```bash
if [ "$FORCE" = "true" ]; then
  # Force removal (ignores uncommitted changes)
  if ! git worktree remove --force "$WORKTREE_PATH" 2>/dev/null; then
    echo "Error: Failed to remove worktree" >&2
    exit 6
  fi
else
  # Normal removal
  if ! git worktree remove "$WORKTREE_PATH" 2>/dev/null; then
    echo "Error: Failed to remove worktree" >&2
    exit 6
  fi
fi
```

9. **Output success message**:
```bash
echo "✓ Worktree removed: $INPUT_PATH"

# If unpushed commits were present, remind user
if [ -n "$UNPUSHED" ]; then
  echo "⚠️  Note: Unpushed commits were deleted"
fi
```

### AskUserQuestion for Unpushed Commits

When unpushed commits are detected, use AskUserQuestion:

```
Question: "This worktree has unpushed commits. Continue removing worktree?"
Options:
  1. "Yes, remove anyway" → Continue with removal
  2. "No, cancel removal" → Exit 0 (cancelled by user)
```

### Error Handling

Exit codes:
- **0**: Cancelled by user (not an error)
- **1**: Not in git repository
- **2**: Not a worktree / path doesn't exist
- **3**: Current worktree (cannot remove)
- **4**: Uncommitted changes (without --force)
- **5**: Main worktree (cannot remove)
- **6**: Git command failed

Always write errors to stderr using `>&2` and provide actionable guidance.

### Security Notes

- Always quote paths in bash commands
- Use realpath to normalize paths for comparison
- Don't expose full paths in error messages if sensitive

### Example Execution

For command: `/fractary-repo:worktree-remove ../core-258`

Expected output (clean removal):
```
✓ Worktree removed: ../core-258
```

Expected output (with uncommitted changes):
```
Error: Uncommitted changes in worktree. Commit or use --force

To see changes:
  cd ../core-258 && git status

To force removal:
  /fractary-repo:worktree-remove ../core-258 --force
```

Expected output (with unpushed commits):
```
⚠️  Warning: Worktree has unpushed commits:
  abc123d Add new feature
  def456e Fix bug

[AskUserQuestion prompt]
```

If user confirms:
```
✓ Worktree removed: ../core-258
⚠️  Note: Unpushed commits were deleted
```
