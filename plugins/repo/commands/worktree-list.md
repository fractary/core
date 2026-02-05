---
name: fractary-repo:worktree-list
allowed-tools: Bash(fractary-core repo worktree-list:*)
description: List all git worktrees with metadata
model: claude-haiku-4-5
argument-hint: '[--json] [--context "<text>"]'
---

## Your task

List all git worktrees using the CLI command `fractary-core repo worktree-list`.

Parse arguments:
- --json: Output as JSON for structured data

Examples:
- Basic list: `fractary-core repo worktree-list`
- JSON output: `fractary-core repo worktree-list --json`

You have the capability to call multiple tools in a single response. Execute the worktree list in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
