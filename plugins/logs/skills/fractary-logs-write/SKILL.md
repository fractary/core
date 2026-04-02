---
name: fractary-logs-write
description: Write a log entry. Use when writing content to a storage path.
---

# Write

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--issue` | No | issue |
| `--json` | No | json |
| `--context` | No | context |
| `--type` | Yes | type |
| `--title` | Yes | title |
| `--content` | Yes | content |

## Execution

Write a log entry using the CLI command `fractary-core logs write`.

If title or content not provided in arguments, generate them from the conversation context.

Examples:
- `fractary-core logs write --type session --title "Debug session" --content "Investigated memory leak..." --issue 42`
- `fractary-core logs write --type build --title "Build failure" --content "TypeScript compilation failed..." --json`
- `fractary-core logs write --type debug --title "API timeout" --content "Connection timeout on endpoint..." --issue 15 --json`
