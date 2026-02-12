---
name: fractary-core:env-section-read
allowed-tools: Bash(fractary-core config env-section-read:*)
description: Read a plugin's managed section from an env file
model: claude-haiku-4-5
argument-hint: '<plugin> [--env <name>] [--file <path>]'
---

## Your task

Read a plugin's managed section from an env file using the CLI command `fractary-core config env-section-read`.

Displays the KEY=VALUE pairs owned by the specified plugin within the env file.

Examples:
- Read core section from default .env: `fractary-core config env-section-read fractary-core`
- Read from test env: `fractary-core config env-section-read fractary-core --env test`
- Read from explicit file: `fractary-core config env-section-read fractary-core --file .fractary/env/.env.prod`

Parse the arguments from $ARGUMENTS and execute the appropriate command. Do not use any other tools or do anything else.
