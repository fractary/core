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

**SAFETY WARNING**: This command auto-merges PRs. Only use for solo development, hotfixes, documentation, or repos without branch protection requiring reviews.

Based on the above changes:

1. If NOT on main/master/develop, STOP with error — must start from a base branch
2. Create a feature branch using `fractary-core repo branch-create`
3. Create a single commit with an appropriate message using `fractary-core repo commit`
4. Push the branch to origin using `fractary-core repo push`
5. Create a pull request with `--json` using `fractary-core repo pr-create` — extract PR number from output
6. Check branch protection: `gh api repos/{owner}/{repo}/branches/main/protection --jq '.required_pull_request_reviews.required_approving_review_count' 2>/dev/null || echo "0"` — if reviews required > 0, STOP with error
7. If `--wait-for-checks` passed, poll `gh pr view <number> --json statusCheckRollup` every 10s for max 5 minutes
8. Merge the PR using `fractary-core repo pr-merge` with the requested strategy (default: merge) and `--delete-branch`
9. Checkout the base branch and `fractary-core repo pull`

You have the capability to call multiple tools in a single response. You MUST do all of the above in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
