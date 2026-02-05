---
name: fractary-docs:doc-search
allowed-tools: Bash(fractary-core docs doc-search:*)
description: Search documents
model: claude-haiku-4-5
argument-hint: '[--text "<query>"] [--tags <tags>] [--doc-type <type>] [--json] [--context "<text>"]'
---

## Your task

Search documents using the CLI command `fractary-core docs doc-search`.

Parse arguments:
- --text: Search text in content and title
- --tags: Filter by tags (comma-separated)
- --author: Filter by author
- --category: Filter by category
- --doc-type: Filter by document type
- --limit: Limit results (default: 10)
- --json: Output as JSON for structured data

Examples:
- `fractary-core docs doc-search --text "authentication" --json`
- `fractary-core docs doc-search --doc-type adr --json`
- `fractary-core docs doc-search --tags "api,design" --limit 5 --json`

You have the capability to call multiple tools in a single response. Execute the search operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
