---
name: fractary-repo:pr-merge
allowed-tools: Bash(fractary-core repo pr-merge:*), Bash(gh pr view:*)
description: Merge pull requests
model: claude-haiku-4-5
argument-hint: '<pr_number> [--strategy <merge|squash|rebase>] [--delete-branch] [--json] [--context "<text>"]'
---

## Context

- Repository: !`gh repo view --json nameWithOwner -q .nameWithOwner`

## Your task

Merge a pull request using the CLI command `fractary-core repo pr-merge`.

Parse arguments:
- pr_number (required): PR number to merge
- --strategy: Merge strategy (merge, squash, rebase). Default: squash.
- --delete-branch: Delete branch after merge
- --json: Output as JSON for structured data

Steps:
1. Get changed files: `gh pr view <pr_number> --json files -q '.files[].path'`
2. Merge the PR: `fractary-core repo pr-merge <number> --strategy <strategy> --delete-branch --json`
3. After successful merge, analyze changed files and output **Required Actions** using the repo-specific mapping below. If no packages or plugins were changed, output: "No packages or plugins require updates."

!`cat .fractary/post-merge-actions.md 2>/dev/null || echo "No post-merge actions configured for this repository."`

Execute all steps in a single message. Do not use any other tools. Do not send any other text.
