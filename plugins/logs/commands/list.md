---
name: fractary-logs:list
allowed-tools: Bash(fractary-core logs list:*)
description: List logs
model: claude-haiku-4-5
argument-hint: '[--type <type>] [--status <status>] [--issue <number>] [--limit <n>] [--json] [--context "<text>"]'
---

## Your task

List logs using the CLI command `fractary-core logs list`.

Parse arguments:
- --type: Filter by log type (session, build, deployment, test, debug, audit, operational, workflow, changelog)
- --status: Filter by status
- --issue: Filter by issue number
- --limit: Limit results (default: 20)
- --json: Output as JSON for structured data

Examples:
- `fractary-core logs list`
- `fractary-core logs list --type session --json`
- `fractary-core logs list --issue 42 --limit 10 --json`
- `fractary-core logs list --type build --status active --json`

You have the capability to call multiple tools in a single response. Execute the list operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
