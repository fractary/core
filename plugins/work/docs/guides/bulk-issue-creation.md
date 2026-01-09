# Bulk Issue Creation Guide

## Overview

Create multiple issues at once using AI-powered analysis of your project and requirements. The `issue-create-bulk` command intelligently creates related issues (datasets, endpoints, templates, etc.) based on your prompt, conversation context, and project structure.

## Quick Start

```bash
# Simple prompt
/fractary-work:issue-create-bulk --prompt "Create issues for all IPEDS datasets"

# Use conversation context (after discussing what needs to be done)
/fractary-work:issue-create-bulk

# With configuration
/fractary-work:issue-create-bulk \
  --prompt "Create issues for API endpoints: users, posts, comments" \
  --type feature \
  --label api \
  --template api-endpoint.md
```

## How It Works

The `issue-bulk-creator` agent follows a 4-step process:

1. **Analyze & Discover**: Analyzes your prompt and conversation context, explores project structure to understand what you're working on
2. **Present Plan**: Shows you exactly what issues it will create with titles, labels, and descriptions
3. **Wait for Confirmation**: Requires your explicit approval before creating anything
4. **Create & Summarize**: Creates the issues after you approve and returns a summary with issue URLs

## Command Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `--prompt <text>` | Description of what to create (optional, uses conversation context if omitted) | `--prompt "Create issues for IPEDS datasets"` |
| `--type <type>` | Issue type label to apply: feature, bug, chore, patch (adds as label, default: no type) | `--type feature` |
| `--label <label>` | Additional labels to apply (repeatable) | `--label dataset --label etl` |
| `--template <name>` | GitHub issue template from `.github/ISSUE_TEMPLATE/` (if project has templates) | `--template dataset-load.md` |
| `--assignee <user>` | Assign all issues to user | `--assignee @username` |

**Note**: The `--type` parameter adds a label (e.g., `--type feature` adds "feature" label). GitHub issues don't have a native type field.

## Usage Examples

### Example 1: Explicit List

Create issues for a specific list of items:

```bash
/fractary-work:issue-create-bulk \
  --prompt "Create issues for: authentication, authorization, audit logging" \
  --type feature \
  --label security
```

The agent will create 3 issues with appropriate titles and labels.

### Example 2: Discovery-Based (Datasets)

Let the agent discover items by exploring your project:

```bash
/fractary-work:issue-create-bulk \
  --prompt "Create issues for all IPEDS datasets" \
  --label dataset --label etl
```

The agent will:
1. Search for datasets in `datasets/`, `data/`, or similar directories
2. Find files like `ipeds/hd.csv`, `ipeds/ic.csv`, etc.
3. Create an issue for each dataset with consistent naming

### Example 3: API Endpoints

Create issues for API endpoints:

```bash
/fractary-work:issue-create-bulk \
  --prompt "Create issues for all v1 API endpoints that need implementation" \
  --label api --label backend
```

The agent will:
1. Search for API route definitions in your codebase
2. Identify incomplete or stub endpoints
3. Create issues for endpoints that need implementation

### Example 4: Using Conversation Context

Discuss what you need, then create issues:

```bash
# In conversation, discuss: "We need authentication, authorization, and logging"

# Then run:
/fractary-work:issue-create-bulk
```

The agent uses the conversation context to determine what issues to create.

### Example 5: With Issue Template

Use a GitHub issue template for consistency:

```bash
/fractary-work:issue-create-bulk \
  --prompt "Create issues for IPEDS datasets: hd, ic, enrollment" \
  --template dataset-load.md
```

All created issues will use the template structure with filled-in placeholders.

## Project-Specific Examples

### Cortheon ETL (Datasets)

For data pipeline projects:

```bash
# Discover all datasets
/fractary-work:issue-create-bulk \
  --prompt "Create issues for all IPEDS datasets in datasets/ipeds/" \
  --type feature \
  --label dataset --label etl

# Explicit dataset list
/fractary-work:issue-create-bulk \
  --prompt "Create issues for IPEDS datasets: hd, ic, enrollment, completions" \
  --type feature \
  --label dataset --label etl \
  --template dataset-load.md
```

### Corthodex (API Endpoints)

For API development projects:

```bash
# Discover incomplete endpoints
/fractary-work:issue-create-bulk \
  --prompt "Create issues for all v1 API endpoints that need implementation" \
  --label api --label v1

# Explicit endpoint list
/fractary-work:issue-create-bulk \
  --prompt "Create issues for API endpoints: users, posts, comments, likes" \
  --type feature \
  --label api --label backend
```

### Corthography (Content Templates)

For content/documentation projects:

```bash
# Discover templates
/fractary-work:issue-create-bulk \
  --prompt "Create issues for content templates in the templates/ directory" \
  --label documentation --label content

# Explicit template list
/fractary-work:issue-create-bulk \
  --prompt "Create issues for: blog post template, landing page template, docs template" \
  --type feature \
  --label template
```

## GitHub Issue Templates

If your project has templates in `.github/ISSUE_TEMPLATE/`, you can use them for consistency:

### Using Templates

```bash
/fractary-work:issue-create-bulk \
  --prompt "Create issues for datasets: hd, ic, enrollment" \
  --template dataset-load.md
```

**How it works**:
- Agent loads the template content from `.github/ISSUE_TEMPLATE/dataset-load.md`
- Uses template content as the issue body for all created issues
- Applies labels from template frontmatter (if present)
- Falls back to generated descriptions if template not found

**Note**: Currently, template content is used as-is. The agent doesn't automatically substitute placeholders like `{dataset-name}`. You may need to customize the template content based on what you're creating, or use templates that are generic enough to apply to all items

## Confirmation Step

**Important**: The agent always shows you what it will create before creating anything.

### Example Confirmation

```
I will create 3 issues:

[1] Load IPEDS hd dataset
    Type: feature
    Labels: dataset, etl, ipeds
    Description: Load and validate IPEDS hd dataset

[2] Load IPEDS ic dataset
    Type: feature
    Labels: dataset, etl, ipeds
    Description: Load and validate IPEDS ic dataset

[3] Load IPEDS enrollment dataset
    Type: feature
    Labels: dataset, etl, ipeds
    Description: Load and validate IPEDS enrollment dataset

Common settings for all issues:
- Template: dataset-load.md
- Workflow: etl

Proceed with creating these 3 issues?
[Yes, create all issues] [No, cancel]
```

You can:
- Review all issue details before approving
- Cancel if the plan isn't what you expected
- Adjust your command and try again

## Best Practices

### 1. Be Specific in Prompts

**Good**:
```bash
--prompt "Create issues for IPEDS datasets: hd, ic, enrollment"
```

**Less Good**:
```bash
--prompt "Create issues for data"
```

### 2. Use Conversation Context

Discuss what needs to be done first, then run the command:

```bash
# In conversation:
User: "We need to implement three features: user authentication, role-based authorization, and audit logging"

# Then:
/fractary-work:issue-create-bulk
```

### 3. Review Confirmation

Always review the plan before approving:
- Check issue titles are descriptive
- Verify labels are correct
- Ensure nothing is missing or duplicated

### 4. Use Templates for Consistency

For related work items, templates ensure:
- Consistent structure across all issues
- Required sections aren't forgotten
- Labels are applied uniformly

### 5. Add Workflow Labels

Specify workflow labels for proper workflow selection:

```bash
--label "workflow:etl"
```

The agent will detect and display the workflow in the plan.

### 6. Leverage Discovery

For discovery-based creation:
- Use clear keywords: "datasets", "endpoints", "templates"
- Specify directory locations: "datasets in datasets/ipeds/"
- Let the agent explore your project structure

## Troubleshooting

### Agent can't find items

**Problem**: Agent says "I couldn't find any datasets"

**Solutions**:
1. **Be more specific**: `--prompt "Create issues for datasets in data/ipeds/"`
2. **Provide explicit list**: `--prompt "Create issues for: hd, ic, enrollment"`
3. **Check paths**: Verify files exist at expected locations

### Wrong workflow selected

**Problem**: Issues assigned to wrong workflow

**Solution**: Add explicit workflow label:
```bash
--label "workflow:etl"
```

### Want different issue structure

**Problem**: Generated issues don't have the structure you want

**Solutions**:
1. **Use template**: `--template my-template.md`
2. **Create template first**, then use it
3. **Edit issues after creation** if needed

### Template not found

**Problem**: `Template not found: .github/ISSUE_TEMPLATE/my-template.md`

**Solutions**:
1. **Check path**: Templates must be in `.github/ISSUE_TEMPLATE/`
2. **Create template**: Add the template file first
3. **Skip template**: Create issues without template, then edit

### Duplicate issues created

**Problem**: Some issues already exist with similar names

**Solution**: The agent checks for duplicates and will warn you. You can:
1. Cancel and review existing issues
2. Adjust prompt to create only new issues
3. Rename existing issues to avoid conflicts

### Authentication errors

**Problem**: `GitHub authentication failed`

**Solution**:
```bash
gh auth login
```

Then retry the bulk creation command.

## Advanced Usage

### Combining with Other Commands

Chain bulk creation with refinement:

```bash
# Create bulk issues
/fractary-work:issue-create-bulk --prompt "Create issues for: auth, authz, logging"

# Refine each issue
/fractary-work:issue-refine 123
/fractary-work:issue-refine 124
/fractary-work:issue-refine 125
```

### Using with Workflows

Create issues with workflow labels:

```bash
/fractary-work:issue-create-bulk \
  --prompt "Create issues for datasets" \
  --label "workflow:etl" \
  --label dataset
```

Issues will automatically enter the ETL workflow.

### Custom Descriptions

The agent generates descriptions based on:
- Project context and structure
- Conversation history
- Template content (if using templates)
- Industry best practices

You can always edit issue descriptions after creation.

## FAQ

### Q: Can I create issues for different types at once?

**A**: Yes, but specify `--type` if they're all the same type. Otherwise, the agent will determine appropriate types for each issue.

### Q: How many issues can I create at once?

**A**: There's no hard limit, but we recommend:
- **Small batches** (3-10 issues): Best for review and confirmation
- **Medium batches** (10-20 issues): Good for structured projects
- **Large batches** (20+ issues): Review carefully before approving

### Q: Can I create issues in different repositories?

**A**: No, the command creates issues in the current repository only. Run the command separately in each repository.

### Q: What if some issues fail to create?

**A**: The agent continues creating remaining issues and provides a summary:
```
⚠ Created 3 of 5 issues:

✓ Successfully created:
- #123: Issue 1
- #124: Issue 2
- #125: Issue 3

✗ Failed to create:
- "Issue 4": Rate limit exceeded
- "Issue 5": Invalid label

You can manually create the failed issues or retry.
```

### Q: Can I cancel after approval?

**A**: Once you approve the plan, the agent begins creating issues. You can interrupt (Ctrl+C), but some issues may already be created.

### Q: How do I customize issue titles?

**A**: Issue titles are generated based on:
1. Your prompt (explicit names)
2. Discovered items (file/directory names)
3. Conversation context (mentioned features)
4. Template content (if using templates)

For custom titles, be specific in your prompt or edit issues after creation.

## Related Commands

- **`/fractary-work:issue-create`** - Create a single issue
- **`/fractary-work:issue-refine`** - Refine issue requirements
- **`/fractary-work:issue-list`** - List existing issues
- **`/fractary-work:issue-fetch`** - Fetch issue details

## Getting Help

If you encounter issues or have questions:

1. **Review this guide** for examples and troubleshooting
2. **Check the spec** at `specs/SPEC-20260108-bulk-issue-creation.md`
3. **Run with --context** to provide additional instructions:
   ```bash
   /fractary-work:issue-create-bulk --context "Additional context or instructions"
   ```

## Summary

The bulk issue creation command is designed to:
- **Save time** when creating multiple similar issues
- **Ensure consistency** across related work items
- **Leverage AI** to understand your project and requirements
- **Provide safety** through confirmation before creation
- **Support flexibility** via templates, discovery, and conversation context

Start with simple prompts, review the confirmation, and iterate based on results. The agent learns from your project structure and context to create high-quality issues efficiently.
