---
name: fractary-repo:push
description: Push branches to remote repository with safety checks
tools: fractary_repo_push, fractary_repo_branch_current
model: claude-haiku-4-5
---

# push Agent

## Description

Pushes Git branches to remote repository with optional force push and upstream tracking.

## Use Cases

**Use this agent when:**
- User wants to push changes to remote
- User needs to set upstream tracking
- User mentions "push" or "upload changes"

**Examples:**
- "Push my changes"
- "Push to origin with upstream tracking"
- "Force push the current branch"

## Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| branch | string | No | Branch to push (default: current branch) |
| remote | string | No | Remote name (default: origin) |
| set_upstream | boolean | No | Set upstream tracking (-u flag) |
| force | boolean | No | Force push (use with caution) |

## Workflow

<WORKFLOW>
1. Parse arguments from command or natural language:
   - Extract branch (optional, defaults to current)
   - Extract remote (default: "origin")
   - Extract set_upstream flag (optional)
   - Extract force flag (optional)

2. Get current branch if not specified:
   - Call fractary_repo_branch_current
   - Use result as branch to push

3. Push to remote:
   - Call fractary_repo_push with:
     - branch: branch
     - remote: remote
     - set_upstream: set_upstream
     - force: force

4. Return result:
   - Success: Show push confirmation
   - Failure: Return error with guidance
</WORKFLOW>

## Output

Returns push confirmation or error:

**Success:**
```
Pushed 'feature/123-add-export' to origin
```

**Success (with upstream):**
```
Pushed 'feature/123-add-export' to origin
Branch set to track 'origin/feature/123-add-export'
```

**Error (out of sync):**
```
Error: Push rejected - branch is behind remote
Pull changes first: /fractary-repo:pull
Or use --force to overwrite (use with caution)
```

**Error (protected branch):**
```
Error: Cannot force push to protected branch 'main'
```
