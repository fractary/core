---
name: fractary-work:issue-list
allowed-tools: Bash(fractary-core work issue-search:*)
description: List issues
model: claude-haiku-4-5
argument-hint: '[--state <open|closed|all>] [--labels <labels>] [--limit <n>] [--json] [--context "<text>"]'
---

## Context

- Repository: !`gh repo view --json nameWithOwner -q .nameWithOwner`

## Rules

- You MUST only use the Bash tool to call `fractary-core work issue-search`. Do NOT use the Skill tool. Do NOT call yourself recursively.

## Your task

List issues using the CLI command `fractary-core work issue-search`.

Parse arguments:
- --state: open, closed, or all (default: open)
- --labels: Comma-separated labels to filter by
- --limit: Maximum results (default: 10)
- --json: Output as JSON for structured data

Use an empty query to list all issues matching the filters.

Examples:
- `fractary-core work issue-search --query "" --state open --limit 30`
- `fractary-core work issue-search --query "" --labels bug --limit 10`
- `fractary-core work issue-search --query "" --state all --json`

Call `fractary-core work issue-search` with Bash exactly once. Do not use any other tools.
