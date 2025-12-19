---
name: fractary-repo:branch-delete
description: Delete Git branches - delegates to fractary-repo:branch-delete agent
allowed-tools: Task(fractary-repo:branch-delete)
model: claude-haiku-4-5
argument-hint: '[branch_name] [--location <local|remote|both>] [--force] [--worktree-cleanup]'
---

Delegates to fractary-repo:branch-delete agent for branch deletion.
