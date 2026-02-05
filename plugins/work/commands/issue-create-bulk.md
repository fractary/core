---
name: fractary-work:issue-create-bulk
description: Create multiple issues at once using AI analysis
allowed-tools: Task(fractary-work:issue-bulk-creator)
model: claude-opus-4-5
argument-hint: '[--context <description>] [--type <type>] [--label <label>] [--template <name>] [--assignee <user>]'
---

Delegates to fractary-work:issue-bulk-creator agent for creating multiple related issues at once.

This command uses AI to intelligently create multiple related issues (datasets, endpoints, templates, etc.). The agent analyzes your project structure and conversation context to determine what issues to create, presents a plan for your approval, and then creates the issues.

## How It Works

1. Command captures arguments and conversation context
2. Task tool invokes `issue-bulk-creator` agent
3. Agent analyzes project structure, conversation, and prompt
4. Agent presents plan showing all issues it will create
5. After user confirmation, agent creates issues
6. Agent returns summary with issue URLs

## Usage Examples

```bash
# Explicit prompt
/fractary-work:issue-create-bulk --prompt "Create issues for IPEDS datasets: hd, ic, enrollment"

# With labels and type
/fractary-work:issue-create-bulk --prompt "Create issues for API endpoints" --type feature --label api

# With template
/fractary-work:issue-create-bulk --prompt "Create issues for datasets" --template dataset-load.md

# Using conversation context (after discussing what needs to be done)
/fractary-work:issue-create-bulk
```

## Arguments

- `--prompt <text>`: Description of what to create (optional, uses conversation context if omitted)
- `--type <type>`: Issue type label to apply: feature|bug|chore|patch (default: no type label)
- `--label <label>`: Additional labels to apply (repeatable)
- `--template <name>`: GitHub issue template from `.github/ISSUE_TEMPLATE/` (if project has templates)
- `--assignee <user>`: Assign all issues to user

**Note**: The `--type` parameter adds a label with that name (e.g., `--type feature` adds the "feature" label). GitHub issues don't have a separate type field.

## Integration with Templates

If `--template` is specified and the project has GitHub issue templates:
- Agent loads template from `.github/ISSUE_TEMPLATE/{name}` (if it exists)
- Uses template content as issue body
- Applies labels from template frontmatter
- Falls back to generated descriptions if template not found

If no template specified:
- Agent generates appropriate titles and descriptions based on project context
- Uses discovered information (datasets, endpoints, etc.) for structure

Use **Task** tool with `fractary-work:issue-bulk-creator` agent to create bulk issues:

```
Task(
  subagent_type="fractary-work:issue-bulk-creator",
  description="Create multiple issues",
  prompt="Create multiple issues based on the user's request: $ARGUMENTS"
)
```
