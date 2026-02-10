---
name: fractary-repo:pull
allowed-tools: Bash(fractary-core repo pull:*)
description: Pull branches from remote
model: claude-haiku-4-5
argument-hint: '[--rebase] [--remote <name>] [--json] [--context "<text>"]'
---

## Context

- Current branch: !`git branch --show-current`
- Remote tracking: !`git rev-parse --abbrev-ref @{upstream} 2>/dev/null || echo "no upstream"`

## Your task

Pull the latest changes from remote using the CLI command `fractary-core repo pull`.

Parse arguments:
- --rebase: Use rebase instead of merge
- --remote: Remote name (default: origin)
- --json: Output as JSON for structured data

Examples:
- `fractary-core repo pull`
- `fractary-core repo pull --rebase`
- `fractary-core repo pull --remote upstream`

Execute in a single message. Do not use any other tools. Do not send any other text.
