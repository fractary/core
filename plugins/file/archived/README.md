# Archived File Plugin Components

This directory contains skills that were used in the v2.0 skill-based architecture.

## Migration to v3.0

As part of the v3.0 Claude Plugin Framework migration, the file plugin was restructured:

### What Changed
- **Commands**: Now ultra-lightweight (8-10 lines) with `allowed-tools: Task(fractary-file:*)` restrictions
- **Agents**: 4 dedicated agents (1:1 with commands) replace the single file-manager agent
- **Skills**: Orchestration skills archived; handlers remain active

### Why Archived (Not Deleted)
These skills contain working implementations that may be useful for:
- Reference when maintaining handlers
- Understanding the configuration wizard logic
- Potential future refactoring back to skills if needed

### Active Components (Not Archived)
- `skills/common/` - Shared utilities
- `skills/handler-storage-local/` - Local filesystem handler
- `skills/handler-storage-r2/` - Cloudflare R2 handler
- `skills/handler-storage-s3/` - AWS S3 handler
- `skills/handler-storage-gcs/` - Google Cloud Storage handler
- `skills/handler-storage-gdrive/` - Google Drive handler

### Archived Skills
- `config-wizard/` - Configuration initialization wizard
- `file-manager/` - File operations manager

## Migration Date
December 2024 - v3.0 Plugin Framework Migration
