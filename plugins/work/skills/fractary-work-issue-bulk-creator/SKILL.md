---
name: fractary-work-issue-bulk-creator
description: Create multiple related issues at once — analyzes project structure, presents plan for confirmation, then creates issues
run_as: agent
---

# Issue Bulk Creator

Intelligently creates multiple related issues at once. Analyzes user request and project context to determine what issues to create, presents a plan for approval, and creates after confirmation.

**Note:** This skill runs as an agent (isolated context) because it performs extensive project scanning.

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--prompt <text>` | No | Description of what to create (uses conversation context if omitted) |
| `--title <text>` | No | Title template with `{placeholder}` variables |
| `--body <text>` | No | Body template with `{placeholder}` variables |
| `--repo <owner/repo>` | No | Target repository |
| `--type <type>` | No | Issue type label: feature, bug, chore, patch |
| `--label <label>` | No | Additional labels (repeatable) |
| `--assignee <user>` | No | Assign all issues to user |
| `--update-existing` | No | Search for existing issues; comment instead of duplicate |
| `--match-labels "<labels>"` | No | Labels for matching existing issues |
| `--exclude-labels "<labels>"` | No | Labels that disqualify matches |

## Execution

Read `docs/creation-flow.md` and follow the bulk creation workflow.

IF prompt suggests discovery (datasets, endpoints, templates):
  Also read `docs/discovery-flow.md` for project structure analysis.
