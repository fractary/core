---
name: fractary-logs:write
allowed-tools: Bash(fractary-core logs write:*)
description: Write a log entry
model: claude-haiku-4-5
argument-hint: '--type <type> --title "<title>" --content "<text>" [--issue <number>] [--json] [--context "<text>"]'
---

## Your task

Write a log entry using the CLI command `fractary-core logs write`.

Parse arguments:
- --type (required): Log type (session, build, deployment, test, debug, audit, operational, workflow, changelog)
- --title (required): Log title
- --content (required): Log content
- --issue: Associated issue number
- --json: Output as JSON for structured data

If title or content not provided in arguments, generate them from the conversation context.

Examples:
- `fractary-core logs write --type session --title "Debug session" --content "Investigated memory leak..." --issue 42`
- `fractary-core logs write --type build --title "Build failure" --content "TypeScript compilation failed..." --json`
- `fractary-core logs write --type debug --title "API timeout" --content "Connection timeout on endpoint..." --issue 15 --json`

You have the capability to call multiple tools in a single response. Execute the write operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
