---
name: fractary-repo-pr-create
description: Create pull requests. Use when creating a pull request.
---

# Pr Create

## Context

First gather current state:
- Run `git branch --show-current`
- Run `git log main..HEAD --oneline`
- Run `git diff main...HEAD --stat`
- Run `git log -1 --format='%s'`

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--title` | No | title |
| `--body` | No | body |
| `--work-id` | No | work id |
| `--draft` | No | draft |
| `--base` | No | base |
| `--json` | No | json |
| `--context` | No | context |

## Execution

Create a pull request using the CLI command `fractary-core repo pr-create`.

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
