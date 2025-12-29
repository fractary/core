---
allowed-tools: Bash(git pull:*), Bash(git status:*)
description: Pull branches from remote
model: claude-haiku-4-5
argument-hint: '[--rebase] [--remote <name>] [--context "<text>"]'
---

## Context

- Current branch: !`git branch --show-current`
- Current status: !`git status --short`
- Remote tracking: !`git branch -vv`

## Your task

Pull the latest changes from remote.

Parse arguments:
- If --rebase: use `git pull --rebase`
- If --remote specified: use that remote, otherwise origin
- Handle merge conflicts gracefully

You have the capability to call multiple tools in a single response. Execute the pull operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
