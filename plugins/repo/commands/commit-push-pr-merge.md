---
name: fractary-repo:commit-push-pr-merge
allowed-tools: Bash(fractary-core repo branch-create:*), Bash(fractary-core repo commit:*), Bash(fractary-core repo push:*), Bash(fractary-core repo pr-create:*), Bash(fractary-core repo pr-merge:*), Bash(gh pr view:*), Bash(gh api:*), Bash(fractary-core repo pull:*), Bash(git checkout:*)
description: Commit, push, create PR, merge, and cleanup branch
model: claude-haiku-4-5
argument-hint: '[--squash|--merge|--rebase] [--wait-for-checks] [--context "<text>"]'
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`

## Your task

**SAFETY WARNING**: This command auto-merges PRs immediately. Only use for:
- Solo development with no review requirements
- Hotfixes where you're authorized to bypass reviews
- Documentation/trivial changes
- Repositories WITHOUT branch protection requiring reviews

**NOT ATOMIC**: If the merge step fails (due to CI, reviews, or branch protection), the PR will remain open. See "Recovery" section below.

### Parse arguments

- Set `STRATEGY="merge"` (default)
- If `--squash` in args: `STRATEGY="squash"`
- If `--rebase` in args: `STRATEGY="rebase"`
- Set `WAIT_FOR_CHECKS=false` (default)
- If `--wait-for-checks` in args: `WAIT_FOR_CHECKS=true`
- Extract `CONTEXT=""` from `--context "<text>"` if present

### Steps

1. **Validate starting point**: Must be on main/master/develop. If on a feature branch, STOP with error.

2. **Create feature branch**:
   `fractary-core repo branch-create <name> --checkout`

3. **Commit changes**:
   `fractary-core repo commit --message "..." --type <type> --all`

4. **Push branch**:
   `fractary-core repo push --set-upstream`

5. **Create PR with JSON output**:
   `fractary-core repo pr-create --title "..." --body "..." --json`
   Extract PR number from JSON output.

6. **Check branch protection** (before attempting merge):
   `gh api repos/:owner/:repo/branches/main/protection --jq '.required_pull_request_reviews.required_approving_review_count' 2>/dev/null || echo "0"`
   If reviews required > 0 and not approved, STOP with actionable error.

7. **Wait for checks** (if --wait-for-checks):
   Poll every 10s for max 5 minutes using `gh pr view "$PR_NUMBER" --json statusCheckRollup`

8. **Verify merge safety**:
   Check for failed/pending checks via `gh pr view "$PR_NUMBER" --json statusCheckRollup`
   Check review decision via `gh pr view "$PR_NUMBER" --json reviewDecision`

9. **Merge PR**:
   `fractary-core repo pr-merge <number> --strategy <strategy> --delete-branch`

10. **Return to base branch**:
    Checkout base branch and `fractary-core repo pull`

### Recovery from failures

- **PR created, merge failed**: PR remains open at `gh pr view "$PR_NUMBER" --web`. Merge manually: `gh pr merge "$PR_NUMBER" --merge --delete-branch`
- **CI checks failed**: Fix issues, push changes, then: `gh pr merge "$PR_NUMBER" --merge --delete-branch`
- **Reviews required**: Request review, after approval: `gh pr merge "$PR_NUMBER" --merge --delete-branch`

### Security

- Always quote shell variables: `"$VAR"` not `$VAR`
- Validate numeric inputs before using in commands
- NEVER bypass branch protection rules

You have the capability to call multiple tools in a single response. You MUST do all of the above in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
