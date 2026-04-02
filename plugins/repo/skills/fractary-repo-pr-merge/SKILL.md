---
name: fractary-repo-pr-merge
description: Merge pull requests. Use when merging a pull request.
---

# Pr Merge

## Context

First gather current state:
- Run `git remote get-url origin 2>/dev/null | sed -E 's|.*[:/]([^/]+/[^/.]+)(\.git)?$|\1|'`

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<pr_number>` | Yes | pr number |
| `--strategy` | No | strategy |
| `--delete-branch` | No | delete branch |
| `--json` | No | json |
| `--context` | No | context |

## Execution

Merge a pull request using the CLI command `fractary-core repo pr-merge`.

Steps:
1. Get changed files: `gh pr view <pr_number> --repo <repo> --json files -q '.files[].path'`
2. Merge the PR: `fractary-core repo pr-merge <number> --strategy <strategy> --delete-branch --json`
3. After successful merge, analyze changed files and output **Required Actions** using the repo-specific mapping below. If no packages or plugins were changed, output: "No packages or plugins require updates."

!`cat .fractary/post-merge-actions.md 2>/dev/null || echo "No post-merge actions configured for this repository."`
