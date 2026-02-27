---
name: fractary-work:issue-create
allowed-tools: Bash(fractary-core work issue-create:*)
description: Create new issue
model: claude-haiku-4-5
argument-hint: '[--title "<title>"] [--body "<text>"] [--labels "<label1,label2>"] [--assignees <users>] [--repo <owner/repo>] [--json] [--context "<text>"]'
---

## Context

- Repository: !`gh repo view --json nameWithOwner -q .nameWithOwner`

## Rules

- You MUST only use the Bash tool to call `fractary-core work issue-create`. Do NOT use the Skill tool. Do NOT call yourself recursively.
- If --title is explicitly provided, use it as the title template. Substitute any `{placeholder}` variables with appropriate values from context, but preserve the overall format, structure, and prefix exactly. Do NOT rewrite, restructure, or generate a different title based on --context.
- If --labels is provided, pass it to the CLI exactly as a quoted comma-separated string: `--labels "label1,label2"`.

## Your task

Create a new issue using the CLI command `fractary-core work issue-create`.

Parse arguments:
- --title: Issue title template. If provided, substitute any `{placeholder}` variables with values from context, then use the result as the title. Preserve the format exactly — do not restructure or rewrite it based on --context.
- --body: Issue description. If provided, use it as-is.
- --labels: Comma-separated labels (e.g. "bug,enhancement"). Pass through to CLI as `--labels "..."`.
- --assignees: Comma-separated users to assign.
- --repo: Target repository as owner/repo (e.g. "corthosai/lake.corthonomy.ai"). Pass through to CLI if provided.
- --json: Output as JSON for structured data.
- --context: Guidance describing what the issue should be about. Use ONLY to synthesize --title or --body when they are NOT explicitly provided.

If --context is provided but --title or --body are missing, synthesize a clear, specific title and detailed body from the context. The title should be concise and the body should expand on the context with actionable details.

If neither --context nor --title are provided, generate them from the conversation context.

Examples:
- `fractary-core work issue-create --title "Bug: login timeout" --body "Users are logged out after 5 minutes" --labels "bug"`
- `fractary-core work issue-create --title "Feature: CSV export" --assignees user1 --labels "feature,enhancement"`
- `fractary-core work issue-create --title "[catalog-create] dataset/table v1" --context "Add this dataset to the data catalog." --labels "faber-workflow:catalog-create,faber-asset-type:catalog" --repo owner/repo`

Call `fractary-core work issue-create` with Bash exactly once. Do not use any other tools.
