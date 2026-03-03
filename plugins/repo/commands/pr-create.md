---
name: fractary-repo:pr-create
allowed-tools: Bash(fractary-core repo pr-create:*)
description: Create pull requests
model: claude-haiku-4-5
argument-hint: '[--title "<title>"] [--body "<body>"] [--work-id <id>] [--draft] [--base <branch>] [--json] [--context "<text>"]'
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
- --work-id: Work item ID to link; ensures `Closes #<id>` is present as plain text in the body
- --draft: Create as draft PR
- --base: Target branch for the PR
- --json: Output as JSON for structured data

If title or body not provided in arguments, generate them from the context above.

## Closing-line injection (when --work-id is provided)

When `--work-id` is supplied:

1. **Normalise** — Scan the body for any line matching `/(closes|fixes|resolves):?\s*#\d+/i`
   (including bold variants like `**Closes:** #123`). Remove that line entirely.
2. **Inject** — Append the following at the end of the body, separated by a blank line:
   ```
   Closes #<id>
   ```
   The line MUST be plain text — no asterisks, brackets, or colons.
3. If `--work-id` is omitted, do not add any closing line.

Examples:
- `fractary-core repo pr-create --title "Add OAuth support" --body "Implements OAuth2 flow"`
- `fractary-core repo pr-create --draft --json`
- `fractary-core repo pr-create --title "Fix bug" --work-id 223`

Execute in a single message. Do not use any other tools. Do not send any other text.
