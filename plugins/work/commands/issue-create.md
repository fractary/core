---
name: fractary-work-issue-create
allowed-tools: Bash(fractary-core work issue-create:*)
description: Create new issue
model: claude-haiku-4-5
argument-hint: '[--title "<title>"] [--body "<text>"] [--labels "<label1,label2>"] [--assignees <users>] [--repo <owner/repo>] [--update-existing] [--match-labels "<labels>"] [--match-title "<title>"] [--exclude-labels "<labels>"] [--json] [--context "<text>"]'
---

## Context

- Repository: !`gh repo view --json nameWithOwner -q .nameWithOwner`

## Rules

- You MUST only use the Bash tool to call `fractary-core work issue-create`. Do NOT use the Skill tool. Do NOT call yourself recursively.
- If --title is explicitly provided, use it as the title template. Substitute any `{placeholder}` variables with appropriate values from context. The resulting title MUST match the substituted template character-for-character. --context MUST NOT add suffixes, prefixes, parenthetical qualifications, descriptive labels, or any other words beyond the substituted placeholders. The title is a contract — not a starting point.
- If --body is explicitly provided, use it as the body template. Substitute any `{placeholder}` variables with appropriate values from context. The resulting body MUST preserve the substituted template's structure and content. --context MUST NOT modify, append to, or rewrite the body when --body is explicitly provided. The body is a contract — not a starting point.
- If --labels is provided, pass it to the CLI exactly as a quoted comma-separated string: `--labels "label1,label2"`.
- If --repo is provided, you MUST pass it to the CLI as `--repo "owner/repo"`. The `## Context` Repository field shows only the calling project — it is NOT the target repository and must not be used as the default when --repo is explicitly provided.
- When --update-existing is provided, pass it along with --match-labels, --match-title, and --exclude-labels to the CLI. These control the find-or-comment behavior — let the CLI handle the matching logic.

## Your task

Create a new issue using the CLI command `fractary-core work issue-create`.

Parse arguments:
- --title: Issue title template. If provided, substitute any `{placeholder}` variables with values from context, then use the result as the title. Preserve the format exactly — do not restructure or rewrite it based on --context.
- --body: Issue description template. If provided, substitute any `{placeholder}` variables with values from context, then use the result as the body. Preserve the structure exactly — do not restructure or rewrite it based on --context.
- --labels: Comma-separated labels (e.g. "bug,enhancement"). Pass through to CLI as `--labels "..."`.
- --assignees: Comma-separated users to assign.
- --repo: Target repository as owner/repo (e.g. "corthosai/lake.corthonomy.ai"). Pass through to CLI if provided.
- --update-existing: When provided, search for an existing open issue matching title and labels. If found, add body as a comment instead of creating a duplicate. Pass through to CLI.
- --match-labels: Comma-separated labels for matching existing issues (defaults to --labels if omitted). Pass through to CLI.
- --match-title: Title to match when searching for existing issues (defaults to --title if omitted). Pass through to CLI.
- --exclude-labels: Comma-separated labels that disqualify an issue from matching (e.g. "faber-in-progress"). Pass through to CLI.
- --json: Output as JSON for structured data.
- --context: Guidance describing what the issue should be about. Use ONLY to synthesize --title or --body when they are NOT explicitly provided.

If --context is provided but --title or --body are missing, synthesize a clear, specific title and detailed body from the context. The title should be concise and the body should expand on the context with actionable details.

If neither --context nor --title are provided, generate them from the conversation context.

Examples:
- `fractary-core work issue-create --title "Bug: login timeout" --body "Users are logged out after 5 minutes" --labels "bug"`
- `fractary-core work issue-create --title "Feature: CSV export" --assignees user1 --labels "feature,enhancement"`
- `fractary-core work issue-create --title "[catalog-create] dataset/table v1" --context "Add this dataset to the data catalog." --labels "faber-workflow:catalog-create,faber-asset-type:catalog" --repo owner/repo`
- `fractary-core work issue-create --title "[catalog-create] dataset/table v1" --body "Upstream change: added new columns X, Y" --labels "faber-workflow:catalog-create" --update-existing --exclude-labels "faber-in-progress" --repo owner/repo`

Call `fractary-core work issue-create` with Bash exactly once. Do not use any other tools.
