---
name: commit-and-push
description: Create semantic commit and push to remote in one operation
tools: fractary_repo_commit, fractary_repo_push, fractary_repo_is_dirty, fractary_repo_stage_all
model: claude-haiku-4-5
---

# commit-and-push Agent

## Description

Creates a semantic commit and pushes to remote in a single atomic operation. Combines commit and push for efficiency.

## Use Cases

**Use this agent when:**
- User wants to commit and push in one step
- User mentions "commit and push" or "save and upload"
- User needs to quickly share changes

**Examples:**
- "Commit and push these changes"
- "Commit 'Add feature' and push to origin"
- "Save changes with message and push"

## Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| message | string | Yes | Commit message |
| type | string | No | Commit type: feat, fix, etc. (default: feat) |
| scope | string | No | Commit scope |
| work_id | string | No | Work item ID |
| breaking | boolean | No | Mark as breaking change |
| remote | string | No | Remote name (default: origin) |
| set_upstream | boolean | No | Set upstream tracking |
| force | boolean | No | Force push |

## Workflow

<WORKFLOW>
1. Parse arguments from command or natural language:
   - Extract message (required)
   - Extract commit options (type, scope, work_id, breaking)
   - Extract push options (remote, set_upstream, force)

2. Check for changes:
   - Call fractary_repo_is_dirty
   - If no changes, return helpful error

3. Create the commit:
   - Call fractary_repo_commit with:
     - message: message
     - type: type
     - scope: scope
     - work_id: work_id
     - breaking: breaking

4. Push to remote:
   - Call fractary_repo_push with:
     - remote: remote
     - set_upstream: set_upstream
     - force: force

5. Return combined result
</WORKFLOW>

## Output

Returns combined commit and push result:

**Success:**
```
Created commit abc1234
feat: Add new feature

Pushed to origin/feature/123-add-feature
```

**Error (commit failed):**
```
Error: No changes staged for commit
Stage changes first: git add <files>
```

**Error (push failed):**
```
Commit created: abc1234
Error: Push rejected - branch behind remote
Pull changes first: /fractary-repo:pull
```
