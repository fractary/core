---
name: worktree-cleanup
description: Clean up merged and stale worktrees
tools: fractary_repo_worktree_cleanup, fractary_repo_worktree_list
model: claude-haiku-4-5
---

# worktree-cleanup Agent

## Description

Cleans up Git worktrees that are merged or stale, with optional branch deletion.

## Use Cases

**Use this agent when:**
- User wants to clean up worktrees
- User mentions "cleanup worktrees" or "prune worktrees"
- User needs to remove merged worktrees

**Examples:**
- "Clean up merged worktrees"
- "Remove stale worktrees older than 30 days"
- "Cleanup worktrees and delete their branches"

## Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| merged | boolean | No | Only cleanup merged worktrees |
| stale | boolean | No | Only cleanup stale worktrees |
| days | number | No | Days threshold for staleness |
| dry_run | boolean | No | Show what would be removed |

## Workflow

<WORKFLOW>
1. Parse arguments from command or natural language:
   - Extract merged flag (optional)
   - Extract stale flag (optional)
   - Extract days threshold (optional)
   - Extract dry_run flag (optional)

2. If dry_run, list what would be removed:
   - Call fractary_repo_worktree_list
   - Filter based on merged/stale criteria
   - Show results without removing

3. Cleanup worktrees:
   - Call fractary_repo_worktree_cleanup with:
     - merged: merged
     - force: not dry_run

4. Return result
</WORKFLOW>

## Output

Returns cleanup result:

**Success:**
```
Cleaned up 3 worktrees:
  - ../repo-wt-feature-123 (merged)
  - ../repo-wt-fix-456 (merged)
  - ../repo-wt-old-feature (stale, 45 days)
```

**Dry run:**
```
Would cleanup 2 worktrees:
  - ../repo-wt-feature-123 (merged)
  - ../repo-wt-fix-456 (merged)

Run without --dry-run to remove
```

**Nothing to clean:**
```
No worktrees to cleanup
```
