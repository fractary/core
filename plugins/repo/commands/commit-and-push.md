---
name: fractary-repo:commit-and-push
description: Create commit and push - delegates to fractary-repo:commit-and-push agent
allowed-tools: Task(fractary-repo:commit-and-push)
model: claude-haiku-4-5
argument-hint: '["message"] [--type <type>] [--work-id <id>] [--scope <scope>] [--breaking] [--description "<text>"] [--remote <name>] [--set-upstream] [--force]'
---

Delegates to fractary-repo:commit-and-push agent for creating commit and pushing to remote.
