# Archived Work Plugin Components

This directory contains skills that were used in the v2.0 skill-based architecture.

## Migration to v3.0

As part of the v3.0 Claude Plugin Framework migration, the work plugin was restructured:

### What Changed
- **Commands**: Now ultra-lightweight (8-18 lines) with `allowed-tools: Task(fractary-work:*)` restrictions
- **Agents**: 21 dedicated agents (1:1 with commands) replace the single work-manager agent
- **Skills**: Orchestration skills archived; handlers remain active

### Why Archived (Not Deleted)
These skills contain working implementations that may be useful for:
- Reference when maintaining handlers
- Understanding the data model and API interactions
- Potential future refactoring back to skills if needed

### Active Components (Not Archived)
- `skills/handler-work-tracker-github/` - GitHub platform handler
- `skills/handler-work-tracker-jira/` - Jira platform handler
- `skills/handler-work-tracker-linear/` - Linear platform handler
- `skills/work-common/` - Shared utilities
- `skills/work-initializer/` - Plugin initialization

### Archived Skills
- `cli-helper/` - CLI argument parsing
- `comment-creator/` - Comment creation
- `comment-lister/` - Comment listing
- `issue-assigner/` - Issue assignment
- `issue-classifier/` - Work type classification
- `issue-creator/` - Issue creation
- `issue-fetcher/` - Issue fetching
- `issue-linker/` - Issue linking
- `issue-searcher/` - Issue search
- `issue-updater/` - Issue updates
- `label-manager/` - Label operations
- `milestone-manager/` - Milestone operations
- `state-manager/` - State transitions

## Migration Date
December 2024 - v3.0 Plugin Framework Migration
