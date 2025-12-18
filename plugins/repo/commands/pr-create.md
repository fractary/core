---
name: fractary-repo:pr-create
description: Create pull requests - delegates to fractary-repo:pr-create agent
allowed-tools: Task
model: claude-haiku-4-5
argument-hint: '"<title>" [--body "<text>"] [--prompt "<instructions>"] [--base <branch>] [--head <branch>] [--work-id <id>] [--draft]'
---

Delegates to fractary-repo:pr-create agent for pull request creation.
