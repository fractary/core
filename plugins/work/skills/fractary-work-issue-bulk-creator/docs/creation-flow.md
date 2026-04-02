# Bulk Issue Creation Flow

## Critical Rules
1. ALWAYS present plan and get confirmation from the user before creating ANY issues
2. ALWAYS check for existing issues to avoid duplicates
3. ALWAYS track success/failure for each issue
4. ALWAYS return summary with issue URLs
5. NEVER create without explicit user approval
6. If --title/--body provided, treat as immutable templates — only substitute {placeholder} variables
7. If --repo provided, pass to every `gh issue create` command

## Step 1: Understand What to Create

1. Parse arguments (title, body, repo, prompt, type, label, assignee, etc.)
2. Analyze conversation context for feature discussions or explicit lists
3. Determine discovery strategy:
   - Keywords "datasets", "data" → filesystem discovery
   - Keywords "endpoints", "API" → code search
   - Keywords "templates" → filesystem search
   - Explicit list → parse directly
   - Conversation context → extract from messages

4. If discovery needed, read `discovery-flow.md`

## Step 2: Present Plan (MANDATORY)

Present to the user:
- Number of issues to create
- Title/body for each issue (with placeholders resolved)
- Labels and assignee
- Options: "Create all", "Edit list first", "Cancel"

## Step 3: Create Issues

For each approved issue:

IF --update-existing:
```bash
fractary-core work issue-create --update-existing \
  --title "<title>" --body "<body>" \
  [--label "<label>"] [--assignee "<user>"] \
  [--match-labels "<labels>"] [--exclude-labels "<labels>"] \
  [--repo "<repo>"] --json
```
Parse output for `action` field (created/commented).

ELSE:
```bash
gh issue create --title "<title>" --body "<body>" \
  [--label "<label>"] [--assignee "<user>"] \
  [--repo "<repo>"]
```

Track: success/failure, issue URL, action taken.

## Step 4: Return Summary

Report: total created, total commented (if --update-existing), any failures, list of issue URLs.
