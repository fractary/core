---
name: fractary-repo:pull
allowed-tools: Bash(fractary-core repo pull:*)
description: Pull branches from remote
model: claude-haiku-4-5
argument-hint: '[--rebase] [--remote <name>] [--json] [--context "<text>"]'
---

## Your task

Pull the latest changes from remote using the CLI command `fractary-core repo pull`.

Parse arguments:
- --rebase: Use rebase instead of merge
- --remote: Remote name (default: origin)
- --json: Output as JSON for structured data

Examples:
- Basic pull: `fractary-core repo pull`
- With rebase: `fractary-core repo pull --rebase`
- From specific remote: `fractary-core repo pull --remote upstream`

You have the capability to call multiple tools in a single response. Execute the pull operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
