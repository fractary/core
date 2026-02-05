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
- Basic: `fractary-core repo branch-create feature/123`
- With base: `fractary-core repo branch-create feature/123 --base main`
- With checkout: `fractary-core repo branch-create feature/123 --checkout`
- JSON output: `fractary-core repo branch-create feature/123 --json`

You have the capability to call multiple tools in a single response. Execute the branch creation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
