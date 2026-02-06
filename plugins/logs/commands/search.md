---
name: fractary-logs:search
allowed-tools: Bash(fractary-core logs search:*)
description: Search logs
model: claude-haiku-4-5
argument-hint: '--query "<text>" [--type <type>] [--issue <number>] [--regex] [--limit <n>] [--json] [--context "<text>"]'
---

## Your task

Search logs using the CLI command `fractary-core logs search`.

Parse arguments:
- --query (required): Search query text
- --type: Filter by log type (session, build, deployment, test, debug, audit, operational, workflow, changelog)
- --issue: Filter by issue number
- --regex: Use regex for search
- --limit: Limit results (default: 10)
- --json: Output as JSON for structured data

Examples:
- `fractary-core logs search --query "error" --json`
- `fractary-core logs search --query "timeout" --type build --json`
- `fractary-core logs search --query "deploy.*fail" --regex --issue 42 --json`
- `fractary-core logs search --query "memory leak" --limit 5 --json`

You have the capability to call multiple tools in a single response. Execute the search operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
