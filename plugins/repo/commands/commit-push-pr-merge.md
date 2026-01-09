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

2. **Create branch**: Create a new branch if currently on main/master

3. **Commit changes**: Stage all changes and create a single commit with appropriate message

4. **Push branch**: Push the branch to origin with upstream tracking

5. **Create PR**: Create pull request using `gh pr create --json number,url` and capture structured output

6. **Extract PR number**: Parse PR number from JSON output using `jq -r .number`

7. **Wait for checks** (if --wait-for-checks specified):
   - Poll PR status: `gh pr view <number> --json statusCheckRollup`
   - Wait until all checks complete (success, failure, or timeout after 5 minutes)
   - If checks fail, STOP and report error - do not merge

8. **Verify merge safety**:
   - Check CI status: `gh pr view <number> --json statusCheckRollup -q '.statusCheckRollup[] | select(.state=="FAILURE") | .context'`
   - If ANY checks failed, STOP and report which checks failed
   - Check if reviews required: `gh pr view <number> --json reviewDecision`
   - If reviewDecision is "REVIEW_REQUIRED" or "CHANGES_REQUESTED", STOP and report blocking reviews

9. **Attempt merge**:
   - Try: `gh pr merge <number> --<strategy> --delete-branch`
   - If merge fails due to branch protection or other rules, capture error and report to user
   - DO NOT bypass branch protection rules

10. **Return to base branch**:
    - Switch back to main/master
    - Pull latest changes from origin

11. **Report results**:
    - Success: Report PR URL and merged branch name
    - Failure: Report specific error (CI failed, reviews required, merge blocked, etc.)

Implementation notes:
- Use structured output: `gh pr create --json number,url` for reliable parsing
- Extract PR number: `PR_NUM=$(gh pr create --json number -q .number)`
- For safety checks, use exit codes: if checks fail, command should exit with error
- If --wait-for-checks specified, implement polling with timeout (max 5 minutes)
- Always verify PR is mergeable before attempting merge
- Error messages should be specific about what blocked the merge

Recovery from failures:
- If PR created but merge fails: PR remains open, branch exists remotely
- If CI fails: User must fix issues and manually merge
- If reviews required: User must get approvals and manually merge
- If branch protection blocks: User must follow repository's merge process

You have the capability to call multiple tools in a single response. You MUST do all of the above in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
