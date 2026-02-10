---
name: fractary-work:issue-create
allowed-tools: Bash(fractary-core work issue-create:*)
description: Create new issue
model: claude-haiku-4-5
argument-hint: '--title "<title>" [--body "<text>"] [--labels <labels>] [--assignees <users>] [--json] [--context "<text>"]'
---

## Context

- Repository: !`gh repo view --json nameWithOwner -q .nameWithOwner`

## Rules

- You MUST only use the Bash tool to call `fractary-core work issue-create`. Do NOT use the Skill tool. Do NOT call yourself recursively.

## Your task

Create a new issue using the CLI command `fractary-core work issue-create`.

Parse arguments:
- --context: Guidance describing what the issue should be about. Use this to generate an appropriate --title and --body when they are not explicitly provided.
- --title (required): Issue title
- --body: Issue description
- --labels: Comma-separated labels to add
- --assignees: Comma-separated users to assign
- --json: Output as JSON for structured data

If --context is provided but --title or --body are missing, synthesize a clear, specific title and detailed body from the context. The title should be concise and the body should expand on the context with actionable details.

If neither --context nor --title are provided, generate them from the conversation context.

Examples:
- `fractary-core work issue-create --title "Bug: login timeout" --body "Users are logged out after 5 minutes" --labels bug`
- `fractary-core work issue-create --title "Feature: CSV export" --assignees user1 --labels feature`

Call `fractary-core work issue-create` with Bash exactly once. Do not use any other tools.
