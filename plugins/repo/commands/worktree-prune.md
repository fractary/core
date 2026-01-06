---
name: fractary-repo:worktree-prune
allowed-tools: Bash(git worktree:*), Bash(git ls-remote:*), Bash(git log:*), Bash(git status:*), Bash(git diff-index:*), Bash(du:*), Bash(date:*), Bash(cd:*), AskUserQuestion
description: Clean up stale and orphaned worktrees
model: claude-sonnet-4-5
argument-hint: '[--dry-run] [--auto] [--max-age <days>]'
---

## Context

- All worktrees: !`git worktree list --porcelain 2>/dev/null | head -100`
- Remote branches: !`git ls-remote --heads origin 2>/dev/null | head -50`

## Your task

Scan for and clean up stale/orphaned worktrees with interactive prompts.

### Argument Parsing

Parse these optional arguments:
- `--dry-run` (FLAG): Show what would be removed without actually removing
- `--auto` (FLAG): Remove without prompting (dangerous)
- `--max-age <days>` (OPTIONAL, default: 30): Consider worktrees older than N days as stale

Extract values like `--max-age 7` to get the number. Default to 30 if not specified.

### Implementation Steps

1. **Validate in git repository**:
```bash
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Error: Not in a git repository" >&2
  exit 1
fi
```

2. **Parse all worktrees**:

Use `git worktree list --porcelain` to get worktree data.

For each worktree:
- Extract path
- Extract branch name (if present)
- Skip main worktree (first one in list)

3. **Detect stale/orphaned worktrees**:

For each non-main worktree, check these conditions:

**Condition 1: Branch deleted on remote AND no uncommitted changes**:
```bash
# Get branch name for worktree
BRANCH=$(git worktree list --porcelain | awk -v path="$WORKTREE_PATH" '
  $0 ~ "^worktree " path "$" {found=1}
  found && /^branch/ {print $2; exit}
' | sed 's@^refs/heads/@@')

# Check if branch exists on remote
if ! git ls-remote --heads origin "$BRANCH" 2>/dev/null | grep -q "refs/heads/$BRANCH"; then
  # Branch deleted on remote - check for uncommitted changes
  if [ -d "$WORKTREE_PATH" ]; then
    cd "$WORKTREE_PATH" 2>/dev/null || continue
    if git diff-index --quiet HEAD -- 2>/dev/null; then
      # No uncommitted changes - mark as stale
      REASON="branch_deleted"
      STALE=true
    fi
    cd - > /dev/null
  else
    # Directory missing
    REASON="directory_missing"
    STALE=true
  fi
fi
```

**Condition 2: No activity for > max-age days**:
```bash
if [ -d "$WORKTREE_PATH" ]; then
  cd "$WORKTREE_PATH" 2>/dev/null || continue

  # Get last commit timestamp
  LAST_COMMIT=$(git log -1 --format=%at 2>/dev/null || echo "0")

  # Calculate days since last activity
  NOW=$(date +%s)
  DAYS_AGO=$(( ($NOW - $LAST_COMMIT) / 86400 ))

  if [ $DAYS_AGO -gt $MAX_AGE ]; then
    REASON="no_activity_${DAYS_AGO}_days"
    STALE=true
  fi

  cd - > /dev/null
fi
```

**Condition 3: Directory missing but git tracking exists**:
```bash
if [ ! -d "$WORKTREE_PATH" ]; then
  REASON="directory_missing"
  STALE=true
fi
```

4. **Collect stale worktrees**:

Build a list of stale worktrees with their reasons:
```bash
# Store in format: path:reason:size
STALE_WORKTREES+=("$WORKTREE_PATH:$REASON:$SIZE")
```

5. **Display findings**:

**Dry Run Mode** (`--dry-run`):
```
[DRY RUN] Would remove the following worktrees:

  📁 ../core-259
     Reason: branch_deleted
     Size: 150M

  📁 ../core-260
     Reason: no_activity_45_days
     Size: 148M

Total: 2 worktrees (~298 MB)

Run without --dry-run to actually remove these worktrees.
```

**Interactive Mode** (default, no flags):

For each stale worktree:
```
Worktree: ../core-259
Branch: feature/259 (deleted on remote)
Reason: branch_deleted
Size: 150M
```

Then use AskUserQuestion:
- Question: "Remove this worktree?"
- Options: "Yes, remove" or "No, keep"
- If yes: Remove with `git worktree remove --force`
- If no: Skip and continue

**Auto Mode** (`--auto`):
```
Scanning for orphaned worktrees...

✓ Removed: ../core-259 (branch_deleted)
✓ Removed: ../core-260 (no_activity_45_days)

Summary:
  ✓ 2 worktrees removed
  💾 Disk space freed: ~298 MB
```

6. **Remove stale worktrees**:

```bash
# For each stale worktree
if [ "$DRY_RUN" = "true" ]; then
  # Just display, don't remove
  continue
fi

if [ "$AUTO" = "true" ]; then
  # Remove without prompting
  git worktree remove --force "$WORKTREE_PATH" 2>/dev/null
  echo "✓ Removed: $WORKTREE_PATH ($REASON)"
  REMOVED_COUNT=$((REMOVED_COUNT + 1))
else
  # Interactive: Use AskUserQuestion for each worktree
  # If user confirms, remove it
fi
```

7. **Cleanup git metadata**:

After removing worktrees (if not dry-run):
```bash
git worktree prune 2>/dev/null
```

8. **Display summary**:

```bash
echo ""
echo "Summary:"
echo "  ✓ $REMOVED_COUNT worktree(s) removed"
echo "  ✓ $KEPT_COUNT worktree(s) kept"
if [ $DISK_FREED -gt 0 ]; then
  echo "  💾 Disk space freed: ~${DISK_FREED}MB"
fi
```

### Disk Usage Calculation

For each worktree, get size:
```bash
SIZE=$(du -sh "$WORKTREE_PATH" 2>/dev/null | awk '{print $1}')

# Convert to MB for summary (approximate)
SIZE_MB=$(du -sm "$WORKTREE_PATH" 2>/dev/null | awk '{print $1}')
TOTAL_FREED=$((TOTAL_FREED + SIZE_MB))
```

### AskUserQuestion for Interactive Mode

For each stale worktree:

```
Question: "Remove worktree at $WORKTREE_PATH?"
Header: "Confirm removal"
Options:
  1. "Yes, remove" → Remove the worktree
  2. "No, keep" → Skip and continue to next
```

### Implementation Tips

- Process worktrees one at a time in interactive mode
- Collect all stale worktrees first, then process them
- Handle missing directories gracefully (can still remove from git tracking)
- Track counts: total scanned, stale found, removed, kept
- Skip main worktree automatically (never consider it stale)

### Error Handling

- Exit code 1: Not in git repository
- Handle git command failures gracefully
- Continue processing remaining worktrees if one fails
- Write errors to stderr using `>&2`

### Example Execution

For command: `/fractary-repo:worktree-prune`

Expected output (interactive):
```
Scanning for orphaned worktrees...

Found 2 stale worktrees:

Worktree: ../core-259
Branch: feature/259 (deleted on remote)
Reason: branch_deleted
Size: 150M

[AskUserQuestion: Remove this worktree?]
> User selects: Yes, remove

✓ Removed: ../core-259

Worktree: ../core-260
Branch: feature/260
Reason: no_activity_45_days
Last activity: 45 days ago
Size: 148M

[AskUserQuestion: Remove this worktree?]
> User selects: No, keep

Skipped: ../core-260

Summary:
  ✓ 1 worktree removed
  ✓ 1 worktree kept
  💾 Disk space freed: ~150 MB
```

For command: `/fractary-repo:worktree-prune --dry-run`

Expected output:
```
[DRY RUN] Would remove the following worktrees:

  📁 ../core-259
     Reason: branch_deleted
     Size: 150M

  📁 ../core-260
     Reason: no_activity_45_days
     Size: 148M

Total: 2 worktrees (~298 MB)

Run without --dry-run to actually remove these worktrees.
```

For command: `/fractary-repo:worktree-prune --auto`

Expected output:
```
Scanning for orphaned worktrees...

✓ Removed: ../core-259 (branch_deleted)
✓ Removed: ../core-260 (no_activity_45_days)

Summary:
  ✓ 2 worktrees removed
  💾 Disk space freed: ~298 MB
```

For command: `/fractary-repo:worktree-prune --max-age 7`

Expected output:
```
Scanning for orphaned worktrees (max age: 7 days)...

Found 1 stale worktree:

Worktree: ../core-265
Branch: feature/265
Reason: no_activity_10_days
Last activity: 10 days ago
Size: 145M

[continues with interactive prompts...]
```

### Security Notes

- Always use `--force` when removing in auto mode (worktrees may have uncommitted changes)
- Don't expose sensitive information in output
- Validate max-age parameter is a positive integer
