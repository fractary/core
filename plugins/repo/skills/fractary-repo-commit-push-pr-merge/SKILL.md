---
name: fractary-repo-commit-push-pr-merge
description: Commit, push, create PR, merge, and cleanup branch. Use when committing, pushing, creating and merging a PR in one step.
---

# Commit Push Pr Merge

## Context

First gather current state:
- Run `git status`
- Run `git diff HEAD`
- Run `git branch --show-current`
- Run `git remote get-url origin 2>/dev/null | sed -E 's|.*[:/]([^/]+/[^/.]+)(\.git)?$|\1|'`

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--work-id` | No | work id |
| `--squash|--merge|--rebase` | No | squash|  merge|  rebase |
| `--skip-ci` | No | skip ci |
| `--context` | No | context |

## Execution

**SAFETY WARNING**: This command auto-merges PRs. Only use for solo development, hotfixes, documentation, or repos without branch protection requiring reviews. CI checks are waited on by default — pass `--skip-ci` to force merge without waiting.

Based on the above changes:

1. If NOT on main/master/develop, STOP with error — must start from a base branch
2. Create a feature branch:
   `fractary-core repo branch-create <name> --checkout`
3. Create a single commit with an appropriate message:
   `fractary-core repo commit --message "<message>" --type <type> --all`
4. Push the branch to origin:
   `fractary-core repo push --set-upstream`
5. Create a pull request (extract PR number from output):
   When `--work-id` is provided, remove any existing closing keyword line from the body
   (any line matching `/(closes|fixes|resolves):?\s*#\d+/i`, including bold variants),
   then append `\n\nCloses #<id>` as plain text at the end of the body before calling:
   `fractary-core repo pr-create --title "<title>" --body "<body with Closes #N appended>" --json`
   Without `--work-id`, call as normal:
   `fractary-core repo pr-create --title "<title>" --body "<body>" --json`
6. Check branch protection — if reviews required > 0, STOP with error:
   `gh api repos/<repo>/branches/main/protection --jq '.required_pull_request_reviews.required_approving_review_count' 2>/dev/null || echo "0"`
7. Unless `--skip-ci` passed, poll every 10s for max 10 minutes until all checks complete or fail:
   `gh pr view <number> --repo <repo> --json statusCheckRollup`
   If any check fails, STOP with error — fix CI before merging (or re-run with --skip-ci to force)
8. Merge the PR with the requested strategy (default: merge):
   `fractary-core repo pr-merge <number> --delete-branch`
9. Checkout the base branch and pull:
   `git checkout <base-branch> && fractary-core repo pull`
