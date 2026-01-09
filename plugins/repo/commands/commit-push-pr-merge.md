---
name: fractary-repo:commit-push-pr-merge
allowed-tools: Bash(git checkout --branch:*), Bash(git add:*), Bash(git status:*), Bash(git push:*), Bash(git commit:*), Bash(gh pr create:*), Bash(gh pr merge:*), Bash(gh pr view:*), Bash(git pull:*)
description: Commit, push, create PR, merge, and cleanup branch
model: claude-haiku-4-5
argument-hint: '[--squash|--merge|--rebase] [--wait-for-checks] [--context "<text>"]'
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`

## Your task

⚠️ **SAFETY WARNING**: This command auto-merges PRs immediately. Only use for:
- Solo development with no review requirements
- Hotfixes where you're authorized to bypass reviews
- Documentation/trivial changes
- Repositories WITHOUT branch protection requiring reviews

DO NOT use if:
- Repository requires code reviews
- CI checks must pass before merge
- Working in a team environment
- Changes affect production code

Parse arguments:
- Merge strategy: --merge (default), --squash, or --rebase
- --wait-for-checks: Wait for CI checks to complete before merging
- --context "<text>": Additional instructions (prepend to workflow)

Steps to execute:

1. **Prepend context if provided**: If --context argument present, use it as additional instructions

2. **Validate base branch**:
   - Check current branch with `CURRENT_BRANCH=$(git branch --show-current)`
   - Verify it's main, master, or develop
   - If on feature branch, STOP with error: "Cannot create PR from feature branch. Switch to main/master first: git checkout main"

3. **Create branch**: Create a new branch if currently on main/master/develop
   - Use semantic naming: `git checkout -b feat/description` or similar

4. **Commit changes**: Stage all changes and create a single commit with appropriate message
   - Use: `git add <files>` (specify files, don't use wildcards in examples)
   - Use: `git commit -m "message"` with properly escaped quotes

5. **Push branch**: Push the branch to origin with upstream tracking
   - Use: `git push origin HEAD -u`

6. **Create PR with JSON output**:
   - Use: `PR_JSON=$(gh pr create --title "..." --body "..." --json number,url)`
   - CRITICAL: Always quote variables: `"$PR_JSON"`

7. **Extract PR number safely**:
   - Use: `PR_NUMBER=$(echo "$PR_JSON" | jq -r .number)`
   - Validate: Check that PR_NUMBER is numeric before proceeding
   - If extraction fails, STOP with error and the PR URL from output

8. **Check branch protection** (before attempting merge):
   - Use: `gh api repos/:owner/:repo/branches/main/protection --jq '.required_pull_request_reviews.required_approving_review_count' 2>/dev/null || echo "0"`
   - If reviews required > 0 and reviewDecision != "APPROVED", STOP with error
   - Report: "Branch protection requires X approving reviews. Get reviews then run: gh pr merge \"$PR_NUMBER\" --merge --delete-branch"

9. **Wait for checks** (if --wait-for-checks specified):
   - Poll every 10 seconds for max 30 iterations (5 minutes total)
   - Check: `gh pr view "$PR_NUMBER" --json statusCheckRollup --jq '.statusCheckRollup[].state'`
   - States: PENDING (keep waiting), SUCCESS (proceed), FAILURE (stop)
   - Count iterations: if i > 30, STOP with timeout error
   - If any check FAILURE, STOP and report which checks failed
   - If timeout, report: "CI checks still running after 5 minutes. Check status: gh pr view \"$PR_NUMBER\" --json statusCheckRollup"

10. **Verify merge safety**:
    - Check CI status: `FAILED_CHECKS=$(gh pr view "$PR_NUMBER" --json statusCheckRollup --jq '.statusCheckRollup[] | select(.state=="FAILURE") | .name' | tr '\n' ', ')`
    - If FAILED_CHECKS not empty, STOP and report: "CI checks failed: $FAILED_CHECKS. View details: gh pr view \"$PR_NUMBER\""
    - Check review decision: `REVIEW_DECISION=$(gh pr view "$PR_NUMBER" --json reviewDecision --jq .reviewDecision)`
    - If reviewDecision is "REVIEW_REQUIRED", STOP and report: "Reviews required. Request review: gh pr review \"$PR_NUMBER\" --comment --body '@reviewer please review'"
    - If reviewDecision is "CHANGES_REQUESTED", STOP and report: "Changes requested in review. View comments: gh pr view \"$PR_NUMBER\" --comments"

11. **Attempt merge with proper quoting**:
    - CRITICAL: Always quote the PR number variable
    - Use: `gh pr merge "$PR_NUMBER" --"$STRATEGY" --delete-branch`
    - Capture output and check exit code
    - If exit code != 0, parse error message for specific failure reason

12. **Handle merge failures gracefully**:
    - If "branch protection" in error: Report protection rules and actionable command
    - If "merge conflict" in error: Report conflict and resolution command
    - If other error: Report full error message and suggest manual merge
    - DO NOT bypass branch protection rules under any circumstances

13. **Return to base branch** (only if merge succeeded):
    - Determine base: `BASE_BRANCH=$(git rev-parse --abbrev-ref HEAD@{upstream} 2>/dev/null | sed 's|origin/||' || echo "main")`
    - Checkout: `git checkout "$BASE_BRANCH"`
    - Pull: `git pull origin "$BASE_BRANCH"`

14. **Report results with actionable commands**:
    - Success: "✅ PR #$PR_NUMBER merged and branch deleted: [URL]"
    - CI Failed: "❌ CI checks failed. Fix and re-run: gh pr merge \"$PR_NUMBER\" --merge"
    - Reviews Required: "❌ Reviews required. After approval: gh pr merge \"$PR_NUMBER\" --merge"
    - Merge Blocked: "❌ Merge blocked by protection. Contact admin or merge via UI: [URL]"

CRITICAL SECURITY NOTES:
- Always quote shell variables: "$VAR" not $VAR
- Never use unquoted variables in commands: gh pr merge "$PR_NUMBER" ✓ not gh pr merge $PR_NUMBER ✗
- Validate numeric inputs before using in commands
- Use explicit error handling with exit codes
- Provide escape hatches for every failure scenario

Implementation notes:
- **Polling details**: 10-second intervals, 30 max iterations (5 minutes), exponential backoff optional
- **Variable quoting**: ALL shell variables must be quoted: "$PR_NUMBER", "$STRATEGY", "$CURRENT_BRANCH"
- **Error codes**: Exit with non-zero on any failure, capture stderr for diagnostics
- **Validation**: Check PR number is numeric, branch names are valid, before executing commands
- **Atomicity disclaimer**: This is NOT atomic - PR may be created but merge fail. Document this clearly.

Recovery from failures (with actionable commands):
- **PR created, merge failed**:
  - PR remains open at: `gh pr view "$PR_NUMBER" --web`
  - Merge manually: `gh pr merge "$PR_NUMBER" --merge --delete-branch`
  - Or close PR: `gh pr close "$PR_NUMBER" --delete-branch`

- **CI checks failed**:
  - View checks: `gh pr view "$PR_NUMBER" --json statusCheckRollup`
  - Fix issues, push changes, then: `gh pr merge "$PR_NUMBER" --merge --delete-branch`

- **Reviews required**:
  - Request review: `gh pr review "$PR_NUMBER" --request @reviewer`
  - After approval: `gh pr merge "$PR_NUMBER" --merge --delete-branch`

- **Branch protection blocks**:
  - View rules: `gh api repos/:owner/:repo/branches/main/protection`
  - Options: Get required approvals, or admin override via web UI

- **Merge conflict**:
  - Fetch latest: `git fetch origin main`
  - Rebase: `git rebase origin/main`
  - Resolve conflicts, push, retry: `gh pr merge "$PR_NUMBER" --merge --delete-branch`

You have the capability to call multiple tools in a single response. You MUST do all of the above in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
