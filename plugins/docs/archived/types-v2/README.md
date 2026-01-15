# Archived Types Directory

**Migration Date**: 2025-01-15
**Reason**: Migrated to skills-based architecture for better Claude discoverability

## What Changed

The `types/{doc_type}/` directory structure has been migrated to `skills/doc-type-{doc_type}/` directories.

**Before (v2.0 - types-based):**
```
plugins/docs/types/
├── adr/
│   ├── schema.json
│   ├── template.md
│   ├── standards.md
│   ├── validation-rules.md
│   └── index-config.json
├── api/
└── ... (11 types)
```

**After (v3.0 - skills-based):**
```
plugins/docs/skills/
├── doc-type-adr/
│   ├── SKILL.md              # NEW: Description with synonyms for auto-discovery
│   ├── schema.json
│   ├── template.md
│   ├── standards.md
│   ├── validation-rules.md
│   └── index-config.json
├── doc-type-api/
├── doc-type-selector/        # NEW: Fallback for type selection
└── ... (12 skills)
```

## Why This Migration

1. **Claude Auto-Discovery**: Each skill has a description with synonyms that Claude can match against user requests
2. **Better Discoverability**: Skills are registered in the plugin manifest and marketplace
3. **Easy Extensibility**: Adding a new document type = adding a new skill directory
4. **Consistent Architecture**: Follows the same pattern as other plugins (file, work, repo)

## New Skill Structure

Each `doc-type-*` skill includes:
- `SKILL.md` - Description, synonyms, WHEN_TO_USE triggers, workflow guidance
- `schema.json` - Frontmatter validation (unchanged from v2.0)
- `template.md` - Document structure (unchanged from v2.0)
- `standards.md` - Writing guidelines (unchanged from v2.0)
- `validation-rules.md` - Quality checks (unchanged from v2.0)
- `index-config.json` - Index organization (unchanged from v2.0)

## Reference

See `docs/RECOMMENDATION-skills-vs-types-architecture.md` for the full analysis and rationale.
