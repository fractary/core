# Archived Docs Plugin Components

This directory contains skills that were used in the v2.0 skill-based architecture.

## Migration to v3.0

As part of the v3.0 Claude Plugin Framework migration, the docs plugin was restructured:

### What Changed
- **Commands**: Now ultra-lightweight (8-10 lines) with `allowed-tools: Task(fractary-docs:*)` restrictions
- **Agents**: 5 dedicated agents (1:1 with commands) replace the single docs-manager agent
- **Skills**: Orchestration skills archived; common utilities remain active

### Why Archived (Not Deleted)
These skills contain working implementations that may be useful for:
- Reference when maintaining the plugin
- Understanding the document processing logic
- Potential future refactoring back to skills if needed

### Active Components (Not Archived)
- `skills/common/` - Shared utilities
- `skills/_shared/` - Shared templates and helpers
- `types/` - Document type definitions (api, adr, guide, dataset, etc.)

### Archived Skills
- `doc-auditor/` - Documentation auditing
- `doc-classifier/` - Document type classification
- `doc-consistency-checker/` - Consistency checking
- `doc-lister/` - Document listing
- `doc-validator/` - Document validation
- `doc-writer/` - Document writing
- `docs-director-skill/` - Batch operations director
- `docs-manager-skill/` - Operations manager

## Migration Date
December 2024 - v3.0 Plugin Framework Migration
