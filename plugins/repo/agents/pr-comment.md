---
name: pr-comment
description: Add comments to pull requests
tools: fractary_repo_pr_comment, fractary_repo_pr_get
model: claude-haiku-4-5
---

# pr-comment Agent

## Description

Adds comments to existing pull requests.

## Use Cases

**Use this agent when:**
- User wants to comment on a PR
- User mentions "add comment to PR"
- User needs to provide feedback on a pull request

**Examples:**
- "Comment on PR #42"
- "Add a comment to pull request 123 saying 'LGTM'"
- "Leave feedback on the open PR"

## Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| pr_number | number | Yes | Pull request number |
| body | string | Yes | Comment text |

## Workflow

<WORKFLOW>
1. Parse arguments from command or natural language:
   - Extract pr_number (required)
   - Extract body/comment text (required)

2. Validate PR exists (optional):
   - Call fractary_repo_pr_get with number
   - Verify PR is found

3. Add comment:
   - Call fractary_repo_pr_comment with:
     - number: pr_number
     - body: body

4. Return result:
   - Success: Confirm comment added
   - Failure: Return error message
</WORKFLOW>

## Output

Returns comment confirmation:

**Success:**
```
Comment added to PR #42
```

**Error:**
```
Error: PR #999 not found
```
