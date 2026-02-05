---
name: fractary-repo:pr-create
allowed-tools: Bash(fractary-core repo pr-create:*)
description: Create pull requests
model: claude-haiku-4-5
argument-hint: '[--title "<title>"] [--body "<body>"] [--draft] [--base <branch>] [--json] [--context "<text>"]'
---

## Context

- Current branch: !`git branch --show-current`
- Commits ahead of main: !`git log main..HEAD --oneline`
- Diff summary: !`git diff main...HEAD --stat`
- Recent commit: !`git log -1 --format='%s'`

## Your task

Create a pull request using `fractary-core repo pr-create`.

If title not provided in arguments:
- Generate from first commit message or branch name
- Example: "feat/123-add-oauth" -> "Add OAuth"

If body not provided in arguments:
- Generate from commit history and diff summary
- Include key changes and files modified

Execute: `fractary-core repo pr-create --title "..." --body "..." [--draft] [--base ...]`

You have the capability to call multiple tools in a single response. Execute the PR creation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
