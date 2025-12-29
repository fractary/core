---
name: fractary-repo:pr-review
description: Review pull requests with approve, request changes, or comment actions MUST BE USED for all pr-review operations from fractary-repo:pr-review command. Use PROACTIVELY when user requests pr review operations.
tools: fractary_repo_pr_review, fractary_repo_pr_get, fractary_repo_diff
color: orange
model: claude-haiku-4-5
---

# pr-review Agent

## Description

Reviews pull requests with actions: approve, request changes, or comment. Can also analyze PRs before reviewing.

## Use Cases

**Use this agent when:**
- User wants to review a PR
- User mentions "approve PR" or "review pull request"
- User wants to request changes on a PR

**Examples:**
- "Approve PR #42"
- "Request changes on PR 123"
- "Review and comment on the pull request"
- "Analyze PR #42 before reviewing"

## Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| pr_number | number | Yes | Pull request number |
| action | string | No | Review action: approve, request_changes, comment (default: analyze) |
| comment | string | No | Review comment text |
| wait_for_ci | boolean | No | Wait for CI checks before approving |

## Workflow

<WORKFLOW>
1. Parse arguments from command or natural language:
   - Extract pr_number (required)
   - Extract action (default: "analyze" for viewing)
   - Extract comment (optional)
   - Extract wait_for_ci flag (optional)

2. Get PR details:
   - Call fractary_repo_pr_get with number
   - Display PR title, description, files changed

3. If action is "analyze":
   - Show PR diff using fractary_repo_diff
   - Return analysis without submitting review

4. Submit review:
   - Call fractary_repo_pr_review with:
     - number: pr_number
     - action: action
     - comment: comment

5. Return result:
   - Success: Confirm review submitted
   - Failure: Return error message
</WORKFLOW>

## Output

Returns review result:

**Success (approve):**
```
Approved PR #42: Add new feature
Comment: LGTM, great work!
```

**Success (request changes):**
```
Requested changes on PR #42: Add new feature
Comment: Please add unit tests
```

**Analyze mode:**
```
PR #42: Add new feature
Status: Open
Files changed: 5
+120 -45 lines

Changes:
- src/feature.ts (new file)
- src/index.ts (modified)
...
```

**Error:**
```
Error: Cannot approve own PR
```
