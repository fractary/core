---
name: fractary-work:issue-create
description: Create new issue - delegates to fractary-work:issue-create agent
allowed-tools: Task(fractary-work:issue-create)
model: claude-haiku-4-5
argument-hint: '"<title>" [--type "feature|bug|chore|patch"] [--body "<text>"] [--prompt "<instructions>"] [--label <label>] [--milestone <milestone>] [--assignee <user>] [--branch-create] [--spec-create]'
---

Delegates to fractary-work:issue-create agent for creating new issues.
