---
name: fractary-work-issue-fetch
allowed-tools: Bash(fractary-core work issue-fetch:*)
description: Fetch issue details
model: claude-haiku-4-5
argument-hint: '<number> [--verbose] [--json] [--context "<text>"]'
---

## Context

- Repository: !`git remote get-url origin 2>/dev/null | sed -E 's|.*[:/]([^/]+/[^/.]+)(\.git)?$|\1|'`

## Rules

- You MUST only use the Bash tool to call `fractary-core work issue-fetch`. Do NOT use the Skill tool. Do NOT call yourself recursively.

## Your task

Fetch issue details using the CLI command `fractary-core work issue-fetch`.

Parse arguments:
- number (required): Issue number
- --verbose: Show additional details (labels, assignees)
- --json: Output as JSON for structured data

Examples:
- `fractary-core work issue-fetch 123`
- `fractary-core work issue-fetch 123 --verbose`
- `fractary-core work issue-fetch 123 --json`

Call `fractary-core work issue-fetch` with Bash exactly once. Do not use any other tools.
