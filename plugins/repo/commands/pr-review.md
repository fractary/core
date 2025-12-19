---
name: fractary-repo:pr-review
description: Review pull requests - delegates to fractary-repo:pr-review agent
allowed-tools: Task(fractary-repo:pr-review)
model: claude-haiku-4-5
argument-hint: '<pr_number> [--action "analyze|approve|request_changes|comment"] [--comment "<text>"] [--wait-for-ci] [--ci-timeout <seconds>]'
---

Delegates to fractary-repo:pr-review agent for pull request review.
