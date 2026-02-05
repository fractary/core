---
name: fractary-docs:doc-create
allowed-tools: Bash(fractary-core docs doc-create:*)
description: Create a new document
model: claude-haiku-4-5
argument-hint: '<id> --title "<title>" --content "<text>" [--doc-type <type>] [--json] [--context "<text>"]'
---

## Your task

Create a new document using the CLI command `fractary-core docs doc-create`.

Parse arguments:
- id (required): Document ID
- --title (required): Document title
- --content (required): Document content
- --doc-type: Document type (adr, api, architecture, etc.)
- --format: Document format (markdown, html, pdf, text)
- --tags: Comma-separated tags
- --category: Document category
- --description: Document description
- --status: Document status
- --json: Output as JSON for structured data

If title or content not provided in arguments, generate them from the conversation context.

Examples:
- `fractary-core docs doc-create guide-001 --title "User Guide" --content "Getting started..." --doc-type guides`
- `fractary-core docs doc-create adr-001 --title "Use PostgreSQL" --content "## Decision..." --doc-type adr --json`
- `fractary-core docs doc-create readme --title "README" --content "# Project" --json`

You have the capability to call multiple tools in a single response. Execute the create operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
