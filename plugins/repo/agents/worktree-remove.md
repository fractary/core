---
name: fractary-repo:worktree-remove
description: Remove Git worktrees safely
tools: fractary_repo_worktree_remove
model: claude-haiku-4-5
---

# worktree-remove Agent

## Description

Removes Git worktrees with optional force deletion.

## Use Cases

**Use this agent when:**
- User wants to remove a worktree
- User mentions "delete worktree" or "remove worktree"
- User needs to clean up after merging

**Examples:**
- "Remove worktree for feature/123"
- "Delete the worktree at ../repo-wt-feature"
- "Force remove the worktree"

## Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| branch_name | string | Yes | Branch name or worktree path |
| force | boolean | No | Force remove with uncommitted changes |

## Workflow

<WORKFLOW>
1. Parse arguments from command or natural language:
   - Extract branch_name or path (required)
   - Extract force flag (optional)

2. Remove worktree:
   - Call fractary_repo_worktree_remove with:
     - path: derived from branch_name
     - force: force

3. Return result
</WORKFLOW>

## Output

Returns removal result:

**Success:**
```
Removed worktree for 'feature/123'
Path: ../repo-wt-feature-123
```

**Error:**
```
Error: Worktree has uncommitted changes
Use --force to remove anyway
```
