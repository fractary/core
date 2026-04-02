---
name: fractary-work-issue-search
description: Search issues. Use when searching for issues.
---

# Issue Search

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
| `--query` | Yes | query |

## Rules

Search issues using the CLI command `fractary-core work issue-search`.

Examples:
- `fractary-core work issue-search --query "login bug"`
- `fractary-core work issue-search --query "timeout" --state open --limit 20`
- `fractary-core work issue-search --query "feature" --labels enhancement --json`
