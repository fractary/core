# PR Review Flow

## Critical Rules
1. ALWAYS fetch comprehensive PR data including comments, reviews, and statusCheckRollup
2. ALWAYS analyze comment content for blocking keywords, not just review states
3. ALWAYS check CI status before recommending approval
4. ALWAYS evaluate review states using most recent review per reviewer
5. ALWAYS provide specific evidence for recommendations
6. NEVER recommend approval if ANY blocking issues exist (P0 or P1)

## Step 1: Fetch PR Data

```bash
gh pr view <pr_number> --json \
  number,title,body,state,url,headRefName,baseRefName,author,isDraft,\
  mergeable,reviewDecision,statusCheckRollup,comments,reviews,\
  createdAt,updatedAt,additions,deletions,changedFiles
```

## Step 2: Analyze (Priority Order — first match wins)

### P0: Merge Conflicts
- `mergeable === "CONFLICTING"` → CANNOT MERGE

### P0: CI Failures
- Any check has `conclusion === "FAILURE"` or `"ERROR"` → DO NOT APPROVE

### P0: Changes Requested
- Group reviews by author, take most recent per reviewer
- Any reviewer's most recent state = CHANGES_REQUESTED → DO NOT APPROVE
- Also check `reviewDecision === "CHANGES_REQUESTED"`

### P1: Blocking Keywords in Comments
Read `blocking-analysis.md` for the dual-track analysis algorithm.

### P2: Review Required
- `reviewDecision === "REVIEW_REQUIRED"` AND no approved reviews → WAIT FOR APPROVALS

### P3: Ready
- All checks pass, no blockers → READY TO APPROVE

## Step 3: Present Structured Analysis

Display comprehensive analysis showing:
- PR metadata (title, branch, author, changes)
- Merge status
- CI status (per-check breakdown)
- Review status (per-reviewer, most recent state)
- Comment analysis (CI track + human track)
- Critical issues summary
- Recommendation with priority level (P0-P3)
- Suggested next steps (context-aware action items)

## Step 4: Submit Review (if action provided)

If --approve, --request-changes, or --comment was specified:

1. Validate action against recommendation (warn if approving with P0/P1 blockers)
2. Execute:
```bash
gh pr review <pr_number> --{action} --body "{comment}"
```
3. Report result
