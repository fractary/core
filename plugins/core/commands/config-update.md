---
name: fractary-core:config-update
description: Update existing Fractary Core configuration incrementally
allowed-tools: Task(fractary-core:config-update-agent)
model: claude-haiku-4-5
argument-hint: '--context "<description of changes>" [--plugins <list>] [--dry-run] [--yes]'
---

Use **Task** tool with `fractary-core:config-update-agent` agent to incrementally update existing Fractary Core configuration.

Interprets natural language descriptions of desired changes and applies them to the existing config while preserving all unrelated sections.

```
Task(
  subagent_type="fractary-core:config-update-agent",
  description="Update Fractary Core config",
  prompt="Update Fractary Core configuration: $ARGUMENTS"
)
```

## Usage Examples

```bash
# Switch work platform to Jira
/fractary-core:config-update --context "switch to jira for work tracking"

# Enable S3 storage
/fractary-core:config-update --context "enable S3 storage with bucket my-bucket"

# Update specific plugin
/fractary-core:config-update --plugins logs --context "change archive path to .fractary/logs/old"
```
