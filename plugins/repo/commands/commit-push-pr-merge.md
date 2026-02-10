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

Use the **Bash** tool for each step below. Do NOT use the Skill tool.

Based on the above changes:

1. If NOT on main/master/develop, STOP with error — must start from a base branch
2. Create a feature branch:
   `fractary-core repo branch-create <name> --checkout`
3. Create a single commit with an appropriate message:
   `fractary-core repo commit --message "<message>" --type <type> --all`
4. Push the branch to origin:
   `fractary-core repo push --set-upstream`
5. Create a pull request (extract PR number from output):
   `fractary-core repo pr-create --title "<title>" --body "<body>" --json`
6. Check branch protection — if reviews required > 0, STOP with error:
   `gh api repos/{owner}/{repo}/branches/main/protection --jq '.required_pull_request_reviews.required_approving_review_count' 2>/dev/null || echo "0"`
7. If `--wait-for-checks` passed, poll every 10s for max 5 minutes:
   `gh pr view <number> --json statusCheckRollup`
8. Merge the PR with the requested strategy (default: merge):
   `fractary-core repo pr-merge <number> --delete-branch`
9. Checkout the base branch and pull:
   `git checkout <base-branch> && fractary-core repo pull`

You MUST use the Bash tool for all commands above. Do NOT use the Skill tool. Execute all steps in a single message.
