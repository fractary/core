---
name: fractary-core:env-section-write
allowed-tools: Bash(fractary-core config env-section-write:*)
description: Write a plugin's managed section to an env file
model: claude-haiku-4-5
argument-hint: '<plugin> [--env <name>] [--file <path>] --set KEY=VALUE [--set KEY=VALUE ...]'
---

## Your task

Write/update a plugin's managed section in an env file using the CLI command `fractary-core config env-section-write`.

Creates or updates the managed section for the specified plugin. Other plugins' sections are preserved untouched.

Examples:
- Write to test env: `fractary-core config env-section-write fractary-core --env test --set "GITHUB_TOKEN=ghp_abc123"`
- Write multiple vars: `fractary-core config env-section-write fractary-core --env prod --set "GITHUB_TOKEN=ghp_abc" --set "AWS_REGION=us-east-1"`
- Write to explicit file: `fractary-core config env-section-write fractary-core --file .fractary/env/.env.example --set "GITHUB_TOKEN=ghp_your_token_here"`

Parse the arguments from $ARGUMENTS and execute the appropriate command. Do not use any other tools or do anything else.
