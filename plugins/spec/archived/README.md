# Archived Spec Plugin Components

This directory contains skills that were used in the v2.0 skill-based architecture.

## Migration to v3.0

As part of the v3.0 Claude Plugin Framework migration, the spec plugin was restructured:

### What Changed
- **Commands**: Now ultra-lightweight (8-10 lines) with `allowed-tools: Task(fractary-spec:*)` restrictions
- **Agents**: 6 dedicated agents (1:1 with commands) replace the single spec-manager agent
- **Skills**: All orchestration skills archived

### Why Archived (Not Deleted)
These skills contain working implementations that may be useful for:
- Reference when maintaining the plugin
- Understanding spec generation and validation logic
- Potential future refactoring back to skills if needed

### Active Components (Not Archived)
None - all skills were orchestration skills and have been archived.

### Archived Skills
- `spec-archiver/` - Specification archival
- `spec-generator/` - Specification generation
- `spec-initializer/` - Plugin initialization
- `spec-linker/` - Issue/PR linking
- `spec-refiner/` - Specification refinement
- `spec-updater/` - Specification updates
- `spec-validator/` - Implementation validation

## Migration Date
December 2024 - v3.0 Plugin Framework Migration
