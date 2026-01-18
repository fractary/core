# Docs Plugin Migration Guide

This document describes how to migrate the `fractary-docs` plugin (in `claude-plugins` repository) to use the new SDK/CLI doc type system.

## Overview

The docs plugin previously maintained its own doc type definitions in `plugins/docs/types/`. These have now been moved to the SDK with CLI access, enabling:

1. **CLI doc type commands**: `fractary-core docs types`, `fractary-core docs type-info <type>`
2. **SDK DocTypeRegistry**: Programmatic access to doc types
3. **Custom types via config**: Projects can define custom doc types in `.fractary/config.yaml`

## Migration Steps

### 1. Update doc-writer Skill

**Before** (direct file reads):
```markdown
1. Load Type Context
   - Read `plugins/docs/types/{doc_type}/template.md`
   - Read `plugins/docs/types/{doc_type}/schema.json`
   - Read `plugins/docs/types/{doc_type}/standards.md`
```

**After** (CLI-based):
```markdown
1. Get Type Definition via CLI
   - Run: `fractary-core docs type-info {doc_type} --json`
   - Parse JSON response for template, standards, frontmatter config
   - If type not found, report error with available types

2. Apply Template
   - Use `template` field from CLI response
   - Use Mustache to render variables

3. Create Document via CLI
   - Run: `fractary-core docs create {id} --title "{title}" --content "{body}" --doc-type {doc_type} --json`
   - Parse response for file path and metadata
```

### 2. Update doc-lister Skill

**Before** (custom listing logic):
```markdown
- Scan docs/ directory
- Parse frontmatter from each file
- Build list with filters
```

**After** (CLI-based):
```markdown
1. List Documents via CLI
   - Run: `fractary-core docs search --doc-type {type} --json`
   - Parse JSON response for document list

2. Format Output
   - Use response data to format table/json/markdown output
```

### 3. Update doc-classifier Skill

**Before** (path pattern matching):
```markdown
- Match path against `docs/{type}/` pattern
- Infer type from directory structure
```

**After** (CLI-enhanced):
```markdown
1. Get Available Types
   - Run: `fractary-core docs types --json`
   - Get list of valid doc type IDs

2. Match Against Types
   - Check if path contains known type ID
   - Check frontmatter for docType field
```

### 4. Update Commands

**write.md**:
```markdown
## What This Does (Updated)

1. Get type definition: `fractary-core docs type-info {doc_type} --json`
2. Generate content using template from type definition
3. Create document: `fractary-core docs create ... --doc-type {doc_type}`
4. Validate (unchanged)
5. Update index (unchanged)
```

**list.md**:
```markdown
## What This Does (Updated)

1. Search documents: `fractary-core docs search --doc-type {type} --json`
2. Format output based on --format flag
```

### 5. Deprecate Plugin Type Definitions

After migration, the following can be removed from the plugin:

```
plugins/docs/types/
├── _untyped/     # Keep - special case
├── adr/          # REMOVE - moved to SDK
├── api/          # REMOVE - moved to SDK
├── architecture/ # REMOVE - moved to SDK
├── audit/        # REMOVE - moved to SDK
├── dataset/      # REMOVE - moved to SDK
├── etl/          # REMOVE - moved to SDK
├── guides/       # REMOVE - moved to SDK
├── infrastructure/ # REMOVE - moved to SDK
├── standards/    # REMOVE - moved to SDK
└── testing/      # REMOVE - moved to SDK
```

### 6. Config Support for Custom Types

Projects can now define custom doc types in `.fractary/config.yaml`:

```yaml
docs:
  custom_types:
    - id: runbook
      path: .fractary/doc-types/runbook.json
    - id: postmortem
      path: .fractary/doc-types/postmortem.json
```

Custom type JSON format:
```json
{
  "id": "runbook",
  "displayName": "Runbook",
  "description": "Operational runbook documentation",
  "template": "# {{title}}\n\n## Overview\n...",
  "outputPath": "docs/runbooks",
  "fileNaming": {
    "pattern": "RUNBOOK-{slug}.md"
  },
  "frontmatter": {
    "requiredFields": ["title", "type", "date"],
    "optionalFields": ["owner", "tags"]
  }
}
```

## CLI Commands Reference

### List Available Types
```bash
fractary-core docs types
fractary-core docs types --json
```

### Get Type Definition
```bash
fractary-core docs type-info adr
fractary-core docs type-info adr --json
fractary-core docs type-info adr --template  # Show template only
fractary-core docs type-info adr --standards # Show standards only
```

### Create Document with Type
```bash
fractary-core docs create my-doc-id \
  --title "My Document" \
  --content "# Content here" \
  --doc-type adr \
  --status proposed
```

### Search by Type
```bash
fractary-core docs search --doc-type adr
fractary-core docs search --doc-type api --json
```

## Benefits of Migration

1. **Single source of truth** - Doc types defined once in SDK
2. **CLI/MCP access** - Types available to all interfaces, not just plugins
3. **Custom types** - Projects can define their own doc types
4. **Reduced context** - No need to load skill per doc type
5. **Consistent behavior** - SDK enforces frontmatter, validation, etc.

## Backward Compatibility

The SDK's `DocsManager` now reads frontmatter from markdown files by default, which matches what the plugin was doing. Existing documents with frontmatter will continue to work.

Documents created with the old sidecar `.meta.yaml` approach will still be readable (the SDK checks both modes).
