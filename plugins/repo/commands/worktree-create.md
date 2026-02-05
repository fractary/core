---
name: fractary-repo:worktree-create
allowed-tools: Bash(fractary-core repo worktree-create:*)
description: Create a new git worktree for workflow execution
model: claude-haiku-4-5
argument-hint: '<branch> [--work-id <id>] [--path <path>] [--base <branch>] [--no-checkout] [--json] [--context "<text>"]'
---

## Your task

Create a new git worktree using the CLI command `fractary-core repo worktree-create`.

Parse arguments:
- branch (required): Branch name for worktree
- --work-id: Work item identifier
- --path: Custom worktree path
- --base: Base branch to create from
- --no-checkout: Skip checking out files
- --json: Output as JSON for structured data

Examples:
- Basic: `fractary-core repo worktree-create feature/123 --work-id 123`
- With path: `fractary-core repo worktree-create feature/123 --work-id 123 --path ../project-123`
- With base: `fractary-core repo worktree-create feature/123 --work-id 123 --base develop`
- JSON output: `fractary-core repo worktree-create feature/123 --work-id 123 --json`

You have the capability to call multiple tools in a single response. Execute the worktree creation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
