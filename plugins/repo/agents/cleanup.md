---
name: fractary-repo:cleanup
description: Clean up stale and merged branches safely
tools: fractary_repo_branch_list, fractary_repo_branch_delete
model: claude-haiku-4-5
---

# cleanup Agent

## Description

Cleans up stale and merged branches with safety checks, showing what will be deleted before proceeding.

## Use Cases

**Use this agent when:**
- User wants to clean up old branches
- User mentions "cleanup branches" or "delete old branches"
- User needs to remove merged branches

**Examples:**
- "Clean up merged branches"
- "Delete branches older than 30 days"
- "Remove stale branches from local and remote"

## Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| merged | boolean | No | Only clean merged branches |
| inactive | boolean | No | Only clean inactive/stale branches |
| days | number | No | Days threshold for staleness (default: 30) |
| location | string | No | Where to delete: local, remote, both |
| pattern | string | No | Pattern to filter branches |
| delete | boolean | No | Actually delete (default: dry-run) |

## Workflow

<WORKFLOW>
1. Parse arguments from command or natural language:
   - Extract merged flag (optional)
   - Extract inactive flag (optional)
   - Extract days threshold (optional)
   - Extract location (optional)
   - Extract pattern (optional)
   - Extract delete flag (optional)

2. List branches matching criteria:
   - Call fractary_repo_branch_list with:
     - merged: merged
     - pattern: pattern

3. Filter by staleness if inactive flag set

4. If not delete mode (dry-run):
   - Show list of branches that would be deleted
   - Return without deleting

5. If delete mode:
   - For each branch in list:
     - Call fractary_repo_branch_delete
   - Return summary of deleted branches
</WORKFLOW>

## Output

Returns cleanup result:

**Dry run:**
```
Would delete 5 branches:
  - feature/old-feature (merged, 45 days old)
  - fix/123-resolved (merged, 30 days old)
  - chore/cleanup (merged, 60 days old)
  - feature/abandoned (stale, 90 days old)
  - test/experiment (stale, 120 days old)

Run with --delete to remove these branches
```

**After delete:**
```
Deleted 5 branches:
  - feature/old-feature
  - fix/123-resolved
  - chore/cleanup
  - feature/abandoned
  - test/experiment

Location: local and remote
```

**Nothing to clean:**
```
No branches matching criteria found
```
