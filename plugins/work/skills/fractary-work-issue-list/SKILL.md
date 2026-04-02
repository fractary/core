---
name: fractary-work-issue-list
description: List issues. Use when listing issues.
---

# Issue List

## Context

First gather current state:
- Run `git remote get-url origin 2>/dev/null | sed -E 's|.*[:/]([^/]+/[^/.]+)(\.git)?$|\1|'`

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--state` | No | state |
| `--labels` | No | labels |
| `--limit` | No | limit |
| `--json` | No | json |
| `--context` | No | context |

## Rules

List issues using the CLI command `fractary-core work issue-search`.

Use an empty query to list all issues matching the filters.

Examples:
- `fractary-core work issue-search --query "" --state open --limit 30`
- `fractary-core work issue-search --query "" --labels bug --limit 10`
- `fractary-core work issue-search --query "" --state all --json`
