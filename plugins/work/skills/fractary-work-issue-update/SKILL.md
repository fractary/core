---
name: fractary-work-issue-update
description: Update issue. Use when updating an existing issue.
---

# Issue Update

## Context

First gather current state:
- Run `git remote get-url origin 2>/dev/null | sed -E 's|.*[:/]([^/]+/[^/.]+)(\.git)?$|\1|'`

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<number>` | Yes | number |
| `--title` | No | title |
| `--body` | No | body |
| `--state` | No | state |
| `--json` | No | json |
| `--context` | No | context |

## Rules

Update an issue using the CLI command `fractary-core work issue-update`.

Examples:
- `fractary-core work issue-update 123 --title "Updated title"`
- `fractary-core work issue-update 123 --state closed`
- `fractary-core work issue-update 123 --title "New title" --body "New body" --json`
