---
name: fractary-work-issue-comment
description: Post a comment on an issue
---

# Issue Comment

## Context

First gather current state:
- Run `git remote get-url origin 2>/dev/null | sed -E 's|.*[:/]([^/]+/[^/.]+)(\.git)?$|\1|'`

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<number>` | Yes | number |
| `--json` | No | json |
| `--context` | No | context |
| `--body` | Yes | body |

## Rules

Post a comment on an issue using the CLI command `fractary-core work issue-comment`.

Examples:
- `fractary-core work issue-comment 123 --body "This is my comment"`
- `fractary-core work issue-comment 456 --body "Implementation complete" --json`
