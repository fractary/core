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

Create a pull request using the CLI command `fractary-core repo pr-create`.

Parse arguments:
- --title: PR title (if not provided, generate from commit history or branch name)
- --body: PR description (if not provided, generate from commit history and diff summary)
- --draft: Create as draft PR
- --base: Target branch for the PR
- --json: Output as JSON for structured data

If title or body not provided in arguments, generate them from the context above.

Examples:
- `fractary-core repo pr-create --title "Add OAuth support" --body "Implements OAuth2 flow"`
- `fractary-core repo pr-create --draft --json`

Execute in a single message. Do not use any other tools. Do not send any other text.
