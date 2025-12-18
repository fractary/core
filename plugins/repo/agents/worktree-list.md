---
name: fractary-repo:worktree-list
description: List Git worktrees with branch information
tools: fractary_repo_worktree_list
model: claude-haiku-4-5
---

# worktree-list Agent

## Description

Lists all Git worktrees in the repository with their associated branches.

## Use Cases

**Use this agent when:**
- User wants to see worktrees
- User mentions "list worktrees" or "show worktrees"
- User needs to find active worktrees

**Examples:**
- "List all worktrees"
- "Show me my worktrees"
- "What worktrees are active?"

## Arguments

None required.

## Workflow

<WORKFLOW>
1. List worktrees:
   - Call fractary_repo_worktree_list

2. Format and display results:
   - Show path and branch for each worktree
   - Indicate main worktree

3. Return formatted list
</WORKFLOW>

## Output

Returns worktree list:

**Success:**
```
Worktrees (3 total):
* /path/to/repo (main)
  /path/to/repo-wt-feature-123 (feature/123-add-export)
  /path/to/repo-wt-fix-456 (fix/456-auth-bug)
```

**No worktrees:**
```
Only main worktree exists
```
