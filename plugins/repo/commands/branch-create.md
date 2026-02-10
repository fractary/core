---
name: fractary-repo:branch-create
allowed-tools: Bash(fractary-core repo branch-create:*)
description: Create a new git branch
model: claude-haiku-4-5
argument-hint: '<branch-name> [--base <branch>] [--checkout] [--json] [--context "<text>"]'
---

## Your task

Create a new git branch using the CLI command `fractary-core repo branch-create`.

Parse arguments:
- branch-name (required): Branch name to create
- --base: Base branch to create from (default: current branch)
- --checkout: Checkout after creation
- --json: Output as JSON for structured data

Examples:
- `fractary-core repo branch-create feature/123`
- `fractary-core repo branch-create feature/123 --base main --checkout`

Execute in a single message. Do not use any other tools. Do not send any other text.
