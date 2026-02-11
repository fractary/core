---
name: fractary-repo:pr-merge
allowed-tools: Bash(fractary-core repo pr-merge:*), Bash(gh pr view:*)
description: Merge pull requests
model: claude-haiku-4-5
argument-hint: '<pr_number> [--strategy <merge|squash|rebase>] [--delete-branch] [--json] [--context "<text>"]'
---

## Context

- Repository: !`gh repo view --json nameWithOwner -q .nameWithOwner`

## Your task

Merge a pull request using the CLI command `fractary-core repo pr-merge`.

Parse arguments:
- pr_number (required): PR number to merge
- --strategy: Merge strategy (merge, squash, rebase). Default: squash.
- --delete-branch: Delete branch after merge
- --json: Output as JSON for structured data

Steps:
1. Get changed files: `gh pr view <pr_number> --json files -q '.files[].path'`
2. Merge the PR: `fractary-core repo pr-merge <number> --strategy <strategy> --delete-branch --json`
3. After successful merge, analyze changed files and output **Required Actions**:

### Packages requiring npm publish

| Directory Pattern | Package | Action |
|---|---|---|
| `sdk/js/**` | `@fractary/core` | `cd sdk/js && npm publish` |
| `cli/**` | `@fractary/core-cli` | `cd cli && npm publish` |
| `mcp/server/**` | `@fractary/core-mcp` | `cd mcp/server && npm publish` |

### Plugins requiring sync/update

| Directory Pattern | Plugin | Action |
|---|---|---|
| `plugins/core/**` | fractary-core | `/Fractary-Core-Configure` |
| `plugins/repo/**` | fractary-repo | Reinstall plugin or restart Claude Code |
| `plugins/work/**` | fractary-work | Reinstall plugin or restart Claude Code |
| `plugins/file/**` | fractary-file | Reinstall plugin or restart Claude Code |
| `plugins/logs/**` | fractary-logs | Reinstall plugin or restart Claude Code |
| `plugins/docs/**` | fractary-docs | Reinstall plugin or restart Claude Code |
| `plugins/status/**` | fractary-status | `/Fractary-Status-Sync` |

If no packages or plugins were changed, output: "No packages or plugins require updates."

Execute all steps in a single message. Do not use any other tools. Do not send any other text.
