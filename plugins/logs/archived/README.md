# Archived Logs Plugin Components

This directory contains skills that were used in the v2.0 skill-based architecture.

## Migration to v3.0

As part of the v3.0 Claude Plugin Framework migration, the logs plugin was restructured:

### What Changed
- **Commands**: Now ultra-lightweight (8-10 lines) with `allowed-tools: Task(fractary-logs:*)` restrictions
- **Agents**: 10 dedicated agents (1:1 with commands) replace the single log-manager agent
- **Skills**: Orchestration skills archived; workflow utilities remain active

### Why Archived (Not Deleted)
These skills contain working implementations that may be useful for:
- Reference when maintaining the plugin
- Understanding log processing and archival logic
- Potential future refactoring back to skills if needed

### Active Components (Not Archived)
- `skills/workflow-event-emitter/` - Workflow event utilities
- `types/` - Log type definitions

### Archived Skills
- `log-analyzer/` - Log analysis
- `log-archiver/` - Log archival
- `log-auditor/` - Log auditing
- `log-capturer/` - Session capture
- `log-classifier/` - Log classification
- `log-director-skill/` - Batch operations director
- `log-lister/` - Log listing
- `log-manager-skill/` - Operations manager
- `log-searcher/` - Log search
- `log-summarizer/` - Log summarization
- `log-validator/` - Log validation
- `log-writer/` - Log writing

## Migration Date
December 2024 - v3.0 Plugin Framework Migration
