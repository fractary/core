# Archived Types Directory

**Migration Date**: 2025-01-15
**Reason**: Migrated to skills-based architecture for better Claude discoverability

## What Changed

The `types/{log_type}/` directory structure has been migrated to `skills/log-type-{log_type}/` directories.

**Before (v2.0 - types-based):**
```
plugins/logs/types/
├── session/
│   ├── schema.json
│   ├── template.md
│   ├── standards.md
│   ├── validation-rules.md
│   └── retention-config.json
├── build/
└── ... (9 types)
```

**After (v3.0 - skills-based):**
```
plugins/logs/skills/
├── log-type-session/
│   ├── SKILL.md              # NEW: Auto-discovery metadata
│   ├── schema.json
│   ├── template.md
│   ├── standards.md
│   ├── validation-rules.md
│   └── retention-config.json
├── log-type-build/
├── log-type-selector/        # NEW: Fallback for type selection
└── ... (10 skills)
```

## Why This Migration

1. **Claude Auto-Discovery**: Each skill has a description with synonyms that Claude can match against user requests
2. **Better Discoverability**: Skills are registered in the plugin manifest and marketplace
3. **Easy Extensibility**: Adding a new log type = adding a new skill directory
4. **Consistent Architecture**: Follows the same pattern as docs plugin and file plugin

## New Skill Structure

Each `log-type-*` skill includes:
- `SKILL.md` - Description, synonyms, WHEN_TO_USE triggers, workflow guidance
- `schema.json` - Frontmatter validation (unchanged from v2.0)
- `template.md` - Log structure (unchanged from v2.0)
- `standards.md` - Logging guidelines (unchanged from v2.0)
- `validation-rules.md` - Quality checks (unchanged from v2.0)
- `retention-config.json` - Retention policy (unchanged from v2.0)

## Log Types Migrated

| Type | Description |
|------|-------------|
| session | Claude Code session/conversation logs |
| build | Build process and CI/CD output logs |
| deployment | Deployment and release logs |
| debug | Debug session and troubleshooting logs |
| audit | Security and compliance audit logs |
| test | Test execution and QA result logs |
| workflow | FABER/ETL workflow execution logs |
| operational | System event and infrastructure logs |
| changelog | Version change and release notes logs |

## Reference

See `plugins/docs/docs/RECOMMENDATION-skills-vs-types-architecture.md` for the full analysis and rationale.
