---
allowed-tools: Bash(gh pr merge:*), Bash(gh pr view:*)
description: Merge pull requests
model: claude-haiku-4-5
argument-hint: '<pr_number> [--squash|--merge|--rebase] [--delete-branch] [--context "<text>"]'
---

## Context

- Repository: !`gh repo view --json nameWithOwner -q .nameWithOwner`
- Config defaults: !`cat .fractary/config.yaml 2>/dev/null | grep -A5 'pr:' | grep -A2 'merge:' | grep -E '(strategy|delete_branch):' | tr '\n' ' ' || echo "strategy: squash delete_branch: true"`

## Your task

Merge pull request using `gh pr merge`.

Parse arguments:
- pr_number (required)
- strategy: --squash, --merge, or --rebase
- --delete-branch flag

**Default behavior**: If no strategy flag (--squash, --merge, --rebase) is provided, use the configured default from `.fractary/config.yaml` at `repo.defaults.pr.merge.strategy`. If no --delete-branch flag is provided, check the configured default at `repo.defaults.pr.merge.delete_branch`.

The config defaults shown above indicate the configured values. If the config could not be read, the fallback defaults are: strategy=squash, delete_branch=true.

**Priority**: Explicit command-line flags always override config defaults.

Example: `gh pr merge 42 --squash --delete-branch`

You have the capability to call multiple tools in a single response. Execute the merge operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
