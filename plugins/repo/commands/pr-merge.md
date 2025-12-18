---
name: fractary-repo:pr-merge
description: Merge pull requests - delegates to fractary-repo:pr-merge agent
allowed-tools: Task
model: claude-haiku-4-5
argument-hint: '<pr_number> [--strategy <strategy>] [--delete-branch] [--worktree-cleanup]'
---

Delegates to fractary-repo:pr-merge agent for merging pull requests.
