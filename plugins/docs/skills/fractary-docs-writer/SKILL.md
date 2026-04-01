---
name: fractary-docs-writer
description: Create or update documentation with type-aware templates, standards validation, and work item integration
---

# Docs Writer

Creates or updates documentation using CLI and SDK. Handles type selection, template loading, standards compliance, and work item linking.

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<doc_type>` | No | Document type (auto-selected if omitted) |
| `[file_path]` | No | Path (auto-generated if omitted) |
| `--work-id <number>` | No | GitHub issue number for context and status comments |
| `--skip-validation` | No | Skip validation step |

## Execution

Read `docs/writing-flow.md` and follow the document creation/update workflow.

IF --work-id is provided OR can be auto-detected from git branch:
  Also read `docs/work-integration.md` for work item linking steps.

IF doc_type is not specified:
  Use the fractary-docs-doc-type-selector skill to help select.
