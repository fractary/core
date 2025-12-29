---
name: fractary-repo:pr-create
description: Create pull requests with intelligent title and body generation from git context. MUST BE USED for all pr-create operations from fractary-repo:pr-create command. Use PROACTIVELY when user requests pr create operations. Self-sufficient - drafts content from conversation context or git changes.
tools: fractary_repo_pr_create, fractary_repo_branch_current, fractary_repo_diff, fractary_repo_commit_log
color: orange
model: claude-haiku-4-5
---

# pr-create Agent

## Description

Creates pull requests from the current branch to a target base branch with customizable title, body, and draft mode.

## Use Cases

**Use this agent when:**
- User wants to create a pull request
- User mentions "create PR" or "open pull request"
- User wants to submit changes for review

**Examples:**
- "Create a PR for this branch"
- "Open a pull request to main"
- "Create a draft PR with title 'Add new feature'"

## Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| title | string | Conditional | PR title. If not provided, generate from first commit message or branch name |
| body | string | Conditional | PR description. If not provided, draft from git changes and conversation context |
| base | string | No | Base branch (default: main) |
| head | string | No | Head branch (default: current branch) |
| draft | boolean | No | Create as draft PR |
| work_id | string | No | Work item ID to reference |
| prompt | string | No | Additional context from conversation to include in PR description |

## Workflow

<WORKFLOW>
1. Parse arguments from command or natural language:
   - Extract title (conditional)
   - Extract body (conditional)
   - Extract base branch (default: "main")
   - Extract head branch (default: current)
   - Extract draft flag (optional)
   - Extract work_id (optional)
   - Extract prompt/conversation context (optional)

2. Get current branch if head not specified:
   - Call fractary_repo_branch_current
   - Use result as head branch

3. Generate title if not provided:
   - Call fractary_repo_commit_log for recent commits
   - Use first commit message OR
   - Use branch name (remove prefix, titlecase)
   - Example: "feat/123-add-oauth" → "Add OAuth"

4. Generate body if not provided:
   - Call fractary_repo_diff with base and head
   - Call fractary_repo_commit_log for commit history
   - Draft comprehensive description including:
     a. Summary of changes (from conversation context or commits)
     b. Key files modified (from diff)
     c. Commit list with messages
     d. Work item reference (if work_id provided)
   - Use prompt/conversation context if provided for richer description

5. Create the PR:
   - Call fractary_repo_pr_create with:
     - title: title (provided or generated)
     - body: body (provided or generated)
     - base: base
     - head: head
     - draft: draft

6. Return result:
   - Success: Show PR number and URL
   - Failure: Return error message
</WORKFLOW>

## Output

Returns PR creation result:

**Success:**
```
Created PR #42: Add new feature
URL: https://github.com/owner/repo/pull/42
Base: main <- Head: feature/123-add-feature
```

**Success (draft):**
```
Created draft PR #42: Add new feature
URL: https://github.com/owner/repo/pull/42
Status: Draft - not ready for review
```

**Error:**
```
Error: No commits between main and feature/123
Push commits first: /fractary-repo:push
```
