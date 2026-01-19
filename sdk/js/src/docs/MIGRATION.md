# Docs Plugin Migration Guide

This document describes how to migrate the `fractary-docs` plugin (in `claude-plugins` repository) to use the new SDK/CLI doc type system.

## Architecture Overview

Doc types are now stored as **language-agnostic YAML/Markdown files** in the `doc-types/` directory at the repository root:

```
doc-types/
├── manifest.yaml           # Lists all core types with GitHub URLs
├── adr/
│   ├── type.yaml          # Type definition (schema, frontmatter rules)
│   ├── template.md        # Mustache template for document generation
│   └── standards.md       # Standards and conventions
├── api/
│   └── ...
└── ...
```

### Benefits

- **Language agnostic**: Any SDK (JS, Python, etc.) can parse YAML/Markdown
- **GitHub referenceable**: Types can be fetched via raw GitHub URLs
- **Easy custom types**: Users create a directory with `type.yaml` + `template.md`
- **Multi-file ready**: Directory structure supports future expansion

### GitHub URLs

Core types are accessible at:
- Manifest: `https://raw.githubusercontent.com/fractary/core/main/doc-types/manifest.yaml`
- Type definition: `https://raw.githubusercontent.com/fractary/core/main/doc-types/{type}/type.yaml`
- Template: `https://raw.githubusercontent.com/fractary/core/main/doc-types/{type}/template.md`
- Standards: `https://raw.githubusercontent.com/fractary/core/main/doc-types/{type}/standards.md`

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
├── adr/          # REMOVE - moved to doc-types/
├── api/          # REMOVE - moved to doc-types/
├── architecture/ # REMOVE - moved to doc-types/
├── audit/        # REMOVE - moved to doc-types/
├── dataset/      # REMOVE - moved to doc-types/
├── etl/          # REMOVE - moved to doc-types/
├── guides/       # REMOVE - moved to doc-types/
├── infrastructure/ # REMOVE - moved to doc-types/
├── standards/    # REMOVE - moved to doc-types/
└── testing/      # REMOVE - moved to doc-types/
```

## Custom Doc Types

Projects can define custom doc types as directories:

### 1. Create type directory

```
.fractary/doc-types/runbook/
├── type.yaml      # Required: type definition
├── template.md    # Required: document template
└── standards.md   # Optional: standards/conventions
```

### 2. type.yaml format

```yaml
id: runbook
display_name: Runbook
description: Operational runbook documentation

output_path: docs/runbooks

file_naming:
  pattern: "RUNBOOK-{slug}.md"
  slug_source: title
  slug_max_length: 50

frontmatter:
  required_fields:
    - title
    - type
    - date
  optional_fields:
    - owner
    - tags
  defaults:
    type: runbook
    status: draft

structure:
  required_sections:
    - Overview
    - Steps
  optional_sections:
    - Prerequisites
    - Troubleshooting

status:
  allowed_values:
    - draft
    - approved
    - deprecated
  default: draft
```

### 3. Configure in `.fractary/config.yaml`

```yaml
docs:
  custom_types:
    - id: runbook
      path: .fractary/doc-types/runbook
    - id: postmortem
      path: .fractary/doc-types/postmortem
```

### 4. Use via CLI

```bash
fractary-core docs types          # Lists runbook alongside core types
fractary-core docs create my-runbook --doc-type runbook --title "Service Restart"
```

## SDK Usage

### Load types programmatically

```typescript
import { DocTypeRegistry } from '@fractary/core/docs';

// Load core types automatically
const registry = new DocTypeRegistry();

// Get all types
const allTypes = registry.getAllTypes();

// Get specific type
const adrType = registry.getType('adr');

// Load custom type from URL
await registry.loadCustomTypeFromUrl(
  'runbook',
  'https://example.com/doc-types/runbook'
);
```

### Configure custom types

```typescript
const registry = new DocTypeRegistry({
  customTypes: [
    { id: 'runbook', path: '.fractary/doc-types/runbook' }
  ]
});
```

### Get GitHub URLs

```typescript
// Get manifest URL
DocTypeRegistry.getCoreManifestUrl();
// https://raw.githubusercontent.com/fractary/core/main/doc-types/manifest.yaml

// Get type URL
DocTypeRegistry.getCoreTypeUrl('adr');
// https://raw.githubusercontent.com/fractary/core/main/doc-types/adr
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

1. **Single source of truth** - Doc types defined once, accessible everywhere
2. **Language agnostic** - YAML/Markdown works for JS, Python, or any SDK
3. **CLI/MCP access** - Types available to all interfaces, not just plugins
4. **Custom types** - Projects can define their own doc types as directories
5. **GitHub URLs** - Types can be fetched remotely for cross-project sharing
6. **Reduced context** - No need to load skill per doc type
7. **Consistent behavior** - SDK enforces frontmatter, validation, etc.

## Backward Compatibility

The SDK's `DocsManager` now reads frontmatter from markdown files by default, which matches what the plugin was doing. Existing documents with frontmatter will continue to work.

Documents created with the old sidecar `.meta.yaml` approach will still be readable (the SDK checks both modes).
