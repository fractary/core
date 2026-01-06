---
name: fractary-repo:worktree-list
allowed-tools: Bash(git worktree:*), Bash(git log:*), Bash(git status:*), Bash(git rev-parse:*), Bash(du:*), Bash(date:*), Bash(cd:*), Bash(wc:*)
description: List all git worktrees with metadata
model: claude-haiku-4-5
argument-hint: '[--format table|json|simple]'
---

## Context

- Git worktrees: !`git worktree list --porcelain 2>/dev/null | head -50`
- Repository root: !`git rev-parse --show-toplevel 2>/dev/null || echo "Not in git repository"`

## Your task

List all git worktrees with enriched metadata in multiple formats.

### Argument Parsing

Parse the optional format argument:
- `--format <table|json|simple>` (OPTIONAL, default: table)

Extract from input like `--format json`. If not provided, use "table" as default.

### Implementation Steps

1. **Validate in git repository**:
```bash
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Error: Not in a git repository" >&2
  exit 1
fi
```

2. **Parse worktree data**:

Get porcelain output:
```bash
git worktree list --porcelain
```

This produces output like:
```
worktree /path/to/main
HEAD abc123def456...
branch refs/heads/main

worktree /path/to/feature
HEAD def456abc123...
branch refs/heads/feature/123
```

Parse line by line to extract:
- `worktree` line → path
- `HEAD` line → commit hash (take first 7 chars)
- `branch` line → branch name (strip `refs/heads/` prefix)
- Missing `branch` line = detached HEAD

3. **Enrich each worktree with metadata**:

For each worktree path, gather:

**Last activity** (Unix timestamp):
```bash
LAST_ACTIVITY=$(cd "$WORKTREE_PATH" && git log -1 --format=%at HEAD 2>/dev/null || echo "0")
```

**Uncommitted changes count**:
```bash
CHANGES=$(cd "$WORKTREE_PATH" && git status --short 2>/dev/null | wc -l)
```

**Is main worktree** (first one in list):
```bash
# The first worktree in the list is always the main worktree
IS_MAIN=true  # for first worktree
IS_MAIN=false # for others
```

4. **Format output based on --format flag**:

### Output Format: Simple

Just print paths, one per line:
```bash
echo "/path/to/main"
echo "/path/to/feature-258"
```

### Output Format: JSON

Build a JSON structure:
```json
{
  "worktrees": [
    {
      "path": "/path/to/main",
      "is_main": true,
      "branch": "main",
      "head_commit": "abc123d",
      "uncommitted_changes": 0,
      "last_activity": "2026-01-06T10:00:00Z"
    },
    {
      "path": "/path/to/feature-258",
      "is_main": false,
      "branch": "feature/258",
      "head_commit": "def456a",
      "uncommitted_changes": 3,
      "last_activity": "2026-01-06T12:30:00Z"
    }
  ],
  "summary": {
    "total": 2,
    "main": 1,
    "feature": 1
  }
}
```

Convert Unix timestamps to ISO 8601:
```bash
date -d "@$TIMESTAMP" -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -r "$TIMESTAMP" -u +"%Y-%m-%dT%H:%M:%SZ"
```

### Output Format: Table (default)

Print a human-readable table:

```
Active Worktrees:
  📁 /path/to/main (main)
     Branch: main
     Status: ✓ Main worktree
     Last activity: 2 hours ago

  📁 /path/to/feature-258
     Branch: feature/258
     Status: ✓ Clean
     Last activity: 5 minutes ago
     Changes: 3 uncommitted files

Total: 2 worktrees (1 main + 1 feature)
```

**Time formatting for table**:
```bash
# Convert Unix timestamp to human-readable
NOW=$(date +%s)
SECONDS_AGO=$(( $NOW - $TIMESTAMP ))

if [ $SECONDS_AGO -lt 60 ]; then
  TIME_AGO="less than a minute ago"
elif [ $SECONDS_AGO -lt 3600 ]; then
  MINUTES=$(( $SECONDS_AGO / 60 ))
  TIME_AGO="$MINUTES minute(s) ago"
elif [ $SECONDS_AGO -lt 86400 ]; then
  HOURS=$(( $SECONDS_AGO / 3600 ))
  TIME_AGO="$HOURS hour(s) ago"
else
  DAYS=$(( $SECONDS_AGO / 86400 ))
  TIME_AGO="$DAYS day(s) ago"
fi
```

**Status indicator**:
- Main worktree: "✓ Main worktree"
- No uncommitted changes: "✓ Clean"
- Has uncommitted changes: "⚠ Has uncommitted changes"

5. **Count totals for summary**:
```bash
TOTAL_COUNT=0
MAIN_COUNT=0
FEATURE_COUNT=0

# Increment counters as you process worktrees
```

### Implementation Tips

- Use a temporary file or arrays to collect worktree data before formatting
- Parse the porcelain output carefully (blank lines separate worktrees)
- Handle edge cases: detached HEAD (no branch line), missing directories
- For JSON, use printf to build valid JSON syntax, or use jq if available
- Ensure paths are properly quoted in output

### Example Execution

For command: `/fractary-repo:worktree-list`

Expected output (table format):
```
Active Worktrees:
  📁 /mnt/c/GitHub/fractary/core (main)
     Branch: main
     Status: ✓ Main worktree
     Last activity: 1 hour ago

  📁 /mnt/c/GitHub/fractary/core-258
     Branch: feature/258
     Status: ✓ Clean
     Last activity: 10 minutes ago

Total: 2 worktrees (1 main + 1 feature)
```

For command: `/fractary-repo:worktree-list --format simple`

Expected output:
```
/mnt/c/GitHub/fractary/core
/mnt/c/GitHub/fractary/core-258
```

### Error Handling

- Exit code 1: Not in git repository
- Write errors to stderr using `>&2`
- Handle git command failures gracefully
