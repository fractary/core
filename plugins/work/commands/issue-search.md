---
name: fractary-work:issue-search
allowed-tools: Bash(fractary-core work issue-search:*)
description: Search issues
model: claude-haiku-4-5
argument-hint: '--query "<query>" [--state <state>] [--labels <labels>] [--limit <n>] [--json] [--context "<text>"]'
---

## Your task

Search issues using the CLI command `fractary-core work issue-search`.

Parse arguments:
- --query (required): Search keywords
- --state: Filter by state (open, closed, all) - default: open
- --labels: Comma-separated labels to filter by
- --limit: Maximum results (default: 10)
- --json: Output as JSON for structured data

Examples:
- `fractary-core work issue-search --query "login bug"`
- `fractary-core work issue-search --query "timeout" --state open --limit 20`
- `fractary-core work issue-search --query "feature" --labels enhancement --json`

You have the capability to call multiple tools in a single response. Execute the search operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
