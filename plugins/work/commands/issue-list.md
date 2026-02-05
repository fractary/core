---
name: fractary-work:issue-list
allowed-tools: Bash(fractary-core work issue-search:*)
description: List issues
model: claude-haiku-4-5
argument-hint: '[--state <open|closed|all>] [--labels <labels>] [--limit <n>] [--json] [--context "<text>"]'
---

## Your task

List issues using the CLI command `fractary-core work issue-search`.

Parse arguments:
- --state: open, closed, or all (default: open)
- --labels: comma-separated labels to filter by
- --limit: maximum results (default: 10)
- --json: Output as JSON for structured data

Use an empty query ("") to list all issues matching the filters.

Examples:
- `fractary-core work issue-search --query "" --state open --limit 30`
- `fractary-core work issue-search --query "" --state open --labels bug --limit 10`
- `fractary-core work issue-search --query "" --state all --json`

You have the capability to call multiple tools in a single response. Execute the list operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
