---
name: fractary-core:env-init
allowed-tools: Bash(fractary-core config env-init:*)
description: Initialize .fractary/env/ directory with template files
model: claude-haiku-4-5
argument-hint: '[--context "<text>"]'
---

## Your task

Initialize the `.fractary/env/` directory using the CLI command `fractary-core config env-init`.

This creates the `.fractary/env/` directory, a `.env.example` template, and updates `.fractary/.gitignore` to exclude env files.

Examples:
- Initialize: `fractary-core config env-init`

You have the capability to call multiple tools in a single response. Execute the init operation in a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.
