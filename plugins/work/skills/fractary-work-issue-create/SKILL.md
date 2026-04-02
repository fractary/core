---
name: fractary-work-issue-create
description: Create new issue. Use when creating a new issue.
---

# Issue Create

## Context

First gather current state:
- Run `git remote get-url origin 2>/dev/null | sed -E 's|.*[:/]([^/]+/[^/.]+)(\.git)?$|\1|'`

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--title` | No | title |
| `--body` | No | body |
| `--labels` | No | labels |
| `--assignees` | No | assignees |
| `--repo` | No | repo |
| `--update-existing` | No | update existing |
| `--match-labels` | No | match labels |
| `--match-title` | No | match title |
| `--exclude-labels` | No | exclude labels |
| `--json` | No | json |
| `--context` | No | context |

## Rules

- If --title is explicitly provided, use it as the title template. Substitute any `{placeholder}` variables with appropriate values from context. The resulting title MUST match the substituted template character-for-character. --context MUST NOT add suffixes, prefixes, parenthetical qualifications, descriptive labels, or any other words beyond the substituted placeholders. The title is a contract — not a starting point.
- If --body is explicitly provided, use it as the body template. Substitute any `{placeholder}` variables with appropriate values from context. The resulting body MUST preserve the substituted template's structure and content. --context MUST NOT modify, append to, or rewrite the body when --body is explicitly provided. The body is a contract — not a starting point.
- If --labels is provided, pass it to the CLI exactly as a quoted comma-separated string: `--labels "label1,label2"`.
- If --repo is provided, you MUST pass it to the CLI as `--repo "owner/repo"`. The `## Context` Repository field shows only the calling project — it is NOT the target repository and must not be used as the default when --repo is explicitly provided.
- When --update-existing is provided, pass it along with --match-labels, --match-title, and --exclude-labels to the CLI. These control the find-or-comment behavior — let the CLI handle the matching logic.

Create a new issue using the CLI command `fractary-core work issue-create`.

If --context is provided but --title or --body are missing, synthesize a clear, specific title and detailed body from the context. The title should be concise and the body should expand on the context with actionable details.

If neither --context nor --title are provided, generate them from the conversation context.

Examples:
- `fractary-core work issue-create --title "Bug: login timeout" --body "Users are logged out after 5 minutes" --labels "bug"`
- `fractary-core work issue-create --title "Feature: CSV export" --assignees user1 --labels "feature,enhancement"`
- `fractary-core work issue-create --title "[catalog-create] dataset/table v1" --context "Add this dataset to the data catalog." --labels "faber-workflow:catalog-create,faber-asset-type:catalog" --repo owner/repo`
- `fractary-core work issue-create --title "[catalog-create] dataset/table v1" --body "Upstream change: added new columns X, Y" --labels "faber-workflow:catalog-create" --update-existing --exclude-labels "faber-in-progress" --repo owner/repo`
