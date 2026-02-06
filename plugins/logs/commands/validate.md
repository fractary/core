---
name: fractary-logs:validate
allowed-tools: Bash(fractary-core logs validate:*)
description: Validate a log file against its type schema
model: claude-haiku-4-5
argument-hint: '<file> [--log-type <type>] [--json] [--context "<text>"]'
---

## Your task

Validate a log file against its type schema using the CLI command `fractary-core logs validate`.

Parse arguments:
- file (required): Path to log file
- --log-type: Override log type (auto-detected from frontmatter)
- --json: Output as JSON for structured data

Examples:
- `fractary-core logs validate .fractary/logs/session/2026-01-15-debug.md`
- `fractary-core logs validate ./logs/build-output.md --log-type build --json`
- `fractary-core logs validate .fractary/logs/audit/compliance-check.md --json`

You have the capability to call multiple tools in a single response. Execute the validate operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
