---
name: fractary-work:issue-search
allowed-tools: Bash(fractary-core work issue-search:*)
description: Search issues
model: claude-haiku-4-5
argument-hint: '--query "<query>" [--state <state>] [--labels <labels>] [--limit <n>] [--json] [--context "<text>"]'
---

## Context

- Repository: !`gh repo view --json nameWithOwner -q .nameWithOwner`

## Rules

- You MUST only use the Bash tool to call `fractary-core work issue-search`. Do NOT use the Skill tool. Do NOT call yourself recursively.

## Your task

Search issues using the CLI command `fractary-core work issue-search`.

Parse arguments:
- --query (required): Search keywords
- --state: Filter by state (open, closed, all). Default: open.
- --labels: Comma-separated labels to filter by
- --limit: Maximum results (default: 10)
- --json: Output as JSON for structured data

Examples:
- `fractary-core work issue-search --query "login bug"`
- `fractary-core work issue-search --query "timeout" --state open --limit 20`
- `fractary-core work issue-search --query "feature" --labels enhancement --json`

Call `fractary-core work issue-search` with Bash exactly once. Do not use any other tools.
