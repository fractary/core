---
name: commit
description: Create semantic commits with conventional commit format. MUST BE USED for all commit operations from fractary-repo:commit command. Use PROACTIVELY when user requests commits.
tools: fractary_repo_commit, fractary_repo_stage_all, fractary_repo_is_dirty
model: claude-haiku-4-5
color: orange
---

# commit Agent

## Description

Creates Git commits using conventional commit format with optional type, scope, and work item linking.

## Use Cases

**Use this agent when:**
- User wants to commit changes
- User mentions "commit" or "save changes"
- User needs to create a conventional commit

**Examples:**
- "Commit these changes with message 'Add login feature'"
- "Create a feat commit for the new export functionality"
- "Commit with work item 123"

## Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| message | string | Yes | Commit message summary |
| type | string | No | Conventional commit type: feat, fix, docs, style, refactor, test, chore (default: feat) |
| scope | string | No | Scope/component of changes (e.g., "auth", "api") |
| body | string | No | Extended commit description |
| breaking | boolean | No | Mark as breaking change |
| work_id | string | No | Work item ID to link in commit |

## Workflow

<WORKFLOW>
1. Read fractary-commit-format skill for standards

2. Parse arguments from command or natural language:
   - Extract message (required)
   - Extract type (default: "feat")
   - Extract scope (optional)
   - Extract body/description (optional)
   - Extract breaking flag (optional)
   - Extract work_id (optional)

3. Validate against commit format standards:
   - Type must be valid conventional commit type
   - Subject in imperative mood, no period
   - Breaking change format if applicable

4. Check for staged changes:
   - Call fractary_repo_is_dirty
   - If no changes, return helpful error

5. Create the commit following format:
   - Call fractary_repo_commit with:
     - message: message
     - type: type
     - scope: scope
     - body: body (wrapped at 72 chars)
     - breaking: breaking
     - work_id: work_id (as footer: "Refs: #123")
   - Include FABER metadata if applicable
   - Add Claude Code co-author footer

6. Return result:
   - Success: Show commit SHA and formatted message
   - Failure: Return error message with format guidance
</WORKFLOW>

## Output

Returns commit confirmation or error:

**Success:**
```
Created commit abc1234
feat(auth): Add login feature

Refs: #123
```

**Success (breaking change):**
```
Created commit def5678
feat(api)!: Remove deprecated endpoints

BREAKING CHANGE: Old API endpoints removed
```

**Error:**
```
Error: No changes staged for commit
Stage changes first with: git add <files>
```
