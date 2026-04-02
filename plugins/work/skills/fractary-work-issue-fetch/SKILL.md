---
name: fractary-work-issue-fetch
description: Fetch issue details
---

# Issue Fetch

## Context

First gather current state:
- Run `git remote get-url origin 2>/dev/null | sed -E 's|.*[:/]([^/]+/[^/.]+)(\.git)?$|\1|'`

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<number>` | Yes | number |
| `--verbose` | No | verbose |
| `--json` | No | json |
| `--context` | No | context |

## Rules

Fetch issue details using the CLI command `fractary-core work issue-fetch`.

Examples:
- `fractary-core work issue-fetch 123`
- `fractary-core work issue-fetch 123 --verbose`
- `fractary-core work issue-fetch 123 --json`
