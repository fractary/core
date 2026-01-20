# Fractary Docs Plugin

Type-agnostic documentation system with operation-specific skills and data-driven type context.

**Version**: 3.1.0 | **Architecture**: Operation-focused with SDK/CLI integration

## Overview

The `fractary-docs` plugin provides a flexible, type-agnostic documentation management system. Instead of maintaining separate skills for each document type, v2.0 uses **operation-specific skills** that load type-specific behavior from data files.

### What's New in v2.0

**Architecture Transformation**:
- ✅ **93% less code duplication** - From ~7,000 to ~2,500 lines
- ✅ **Type-agnostic operations** - Single `doc-writer` handles all types
- ✅ **Data-driven behavior** - Type context in `types/{doc_type}/` directories
- ✅ **Simplified coordination** - Unified manager for all document types
- ✅ **Auto-indexing** - Configurable flat/hierarchical organization per type

**Migration from v1.x**:
- Old: 11 type-specific skills (`docs-manage-api`, `docs-manage-adr`, etc.)
- New: 4 operation skills (`doc-writer`, `doc-validator`, `doc-classifier`, `doc-lister`)
- Frontmatter change: `type:` → `fractary_doc_type:`

### Key Features

- **Operation-Specific Skills**: `doc-writer`, `doc-validator`, `doc-classifier`, `doc-lister` handle ANY doc type
- **Type Context System**: 5 files per type (schema, template, standards, validation-rules, index-config)
- **Dual-Format Support**: Generate both README.md and JSON formats simultaneously
- **Automatic Index Management**: Configurable flat or hierarchical organization
- **11 Document Types**: ADR, architecture, dataset, ETL, testing, API, guides, standards, infrastructure, audit, and generic
- **Coordination Pipeline**: Automatic write → validate → index workflow
- **Batch Operations**: Process multiple documents with parallel execution
- **Codex Integration**: Automatic frontmatter for knowledge management
- **Configuration-Driven**: Customize behavior per document type
- **Git-Friendly**: Version control integration

## Quick Start

### 1. Create Documentation

```bash
# Create API documentation
/fractary-docs:write api

# Create ADR
/fractary-docs:write adr

# Create dataset documentation
/fractary-docs:write dataset

# Batch create multiple docs
/fractary-docs:write api docs/api/**/*.md --batch
```

### 2. Validate Documentation

```bash
# Validate all documentation
/fractary-docs:validate

# Validate specific file
/fractary-docs:validate docs/api/user-api/README.md

# Validate specific type
/fractary-docs:validate --doc-type api

# Validate and fix
/fractary-docs:validate docs/ --fix
```

### 3. List Documentation

```bash
# List all documentation
/fractary-docs:list

# List API docs only
/fractary-docs:list --doc-type api

# List draft documents
/fractary-docs:list --status draft

# Output as JSON
/fractary-docs:list --format json

# Output as markdown
/fractary-docs:list --format markdown
```

### 4. Audit Documentation

```bash
# Audit all documentation
/fractary-docs:audit

# Audit specific directory
/fractary-docs:audit docs/api

# Audit specific type
/fractary-docs:audit --doc-type dataset
```

## Architecture

The plugin uses a **three-layer architecture** optimized for context efficiency:

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Commands (Entry Points)                      │
│  /fractary-docs:write, /fractary-docs:validate, /fractary-docs:list, /fractary-docs:audit  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 2: Coordination (Decision & Routing)             │
│  ┌──────────────────┐  ┌──────────────────────────┐    │
│  │ docs-manager     │  │ docs-director-skill      │    │
│  │ (single doc)     │  │ (multi-doc + parallel)   │    │
│  └──────────────────┘  └──────────────────────────┘    │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 3: Operations (Type-Agnostic Execution)          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ doc-     │ │ doc-     │ │ doc-     │ │ doc-     │  │
│  │ writer   │ │ validator│ │ classifier│ │ lister   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Type Context (Data-Driven Behavior via SDK/CLI)        │
│  templates/docs/{doc_type}/  (core types)               │
│  .fractary/docs/templates/   (custom project types)     │
│    ├─ type.yaml             (type definition)          │
│    ├─ template.md           (Mustache template)        │
│    └─ standards.md          (writing guidelines)       │
│                                                         │
│  CLI Commands:                                          │
│    fractary-core docs types      (list all types)      │
│    fractary-core docs type-info  (get type details)    │
└─────────────────────────────────────────────────────────┘
```

### Architecture Benefits

| Aspect | v1.x (Type-Specific) | v2.0 (Operation-Specific) |
|--------|---------------------|--------------------------|
| **Code Duplication** | 93% duplicated | <7% duplicated |
| **Lines of Code** | ~7,000 lines | ~2,500 lines |
| **Skills per Type** | 11 type skills + 3 operation skills | 4 operation skills (universal) |
| **Adding New Type** | Create new skill (500+ lines) | Add 5 data files (~200 lines) |
| **Maintenance** | Change in 11+ places | Change in 1-4 places |
| **Context Usage** | Higher (separate skills) | Lower (shared operations) |

## Document Types

All document types use the same operation skills but with different type context:

| Type | Use Case | Index Organization |
|------|----------|-------------------|
| **api** | API endpoints and services | Hierarchical (service → version) |
| **adr** | Architecture Decision Records | Flat (by date) |
| **architecture** | System architecture docs | Hierarchical (component → layer) |
| **dataset** | Data schema and structure | Hierarchical (source → format) |
| **etl** | ETL pipelines and transformations | Hierarchical (source → target) |
| **testing** | Test plans and strategies | Hierarchical (type → scope) |
| **guides** | User and developer guides | Hierarchical (audience → topic) |
| **standards** | Development standards | Hierarchical (scope → category) |
| **infrastructure** | Infrastructure docs | Hierarchical (provider → service) |
| **audit** | Audit reports and findings | Flat (by date) |
| **_untyped** | Generic/unclassified docs | Flat |

## Type Context System

Document types are defined in `templates/docs/{doc_type}/` (core types) or via custom project templates.

### Core Types Location

Core doc types are stored in the repository at `templates/docs/` and loaded by the SDK:

```
templates/docs/
├── manifest.yaml      # Lists all core doc types with URLs
├── adr/
│   ├── type.yaml     # Type definition (schema, frontmatter, file naming)
│   ├── template.md   # Mustache template
│   └── standards.md  # Writing guidelines
├── api/
├── architecture/
└── ... (11 types total)
```

### Custom Project Types

Projects can define custom doc types by:

1. Setting `custom_templates_path` in `.fractary/config.yaml`:
   ```yaml
   docs:
     custom_templates_path: .fractary/docs/templates/manifest.yaml
   ```

2. Creating a manifest and type directories:
   ```
   .fractary/docs/templates/
   ├── manifest.yaml
   └── runbook/
       ├── type.yaml
       ├── template.md
       └── standards.md
   ```

### CLI Commands

```bash
# List all doc types (core + custom)
fractary-core docs types

# Get type definition
fractary-core docs type-info adr --json

# Create document with type
fractary-core docs create my-doc --doc-type adr --title "My ADR"
```

### Type Definition Files

Each document type is defined by 3 files:

### 1. `schema.json`

Defines the structure and validation rules:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "API Documentation Schema",
  "properties": {
    "fractary_doc_type": {"const": "api"},
    "endpoint": {"type": "string", "pattern": "^/.*"},
    "method": {"enum": ["GET", "POST", "PUT", "DELETE", "PATCH"]},
    "service": {"type": "string"},
    "version": {"type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$"},
    "status": {"enum": ["draft", "published", "deprecated"]}
  },
  "required": ["fractary_doc_type", "endpoint", "method", "service", "version"]
}
```

### 2. `template.md`

Mustache template for generating documents:

```markdown
---
title: "{{title}}"
fractary_doc_type: api
endpoint: {{endpoint}}
method: {{method}}
service: {{service}}
version: {{version}}
status: {{status}}
date: {{date}}
---

# {{title}}

**Endpoint**: `{{method}} {{endpoint}}`
**Service**: {{service}}
**Version**: {{version}}

## Overview

{{overview}}

## Request

{{request_details}}

## Response

{{response_details}}

## Examples

{{examples}}
```

### 3. `standards.md`

Writing guidelines and best practices:

```markdown
# API Documentation Standards

## Required Sections
- Overview (purpose and high-level behavior)
- Request (parameters, headers, body schema)
- Response (status codes, body schema)
- Examples (request/response pairs)

## Naming Conventions
- Endpoint paths use kebab-case
- Service names use PascalCase
- Version follows semantic versioning

## Best Practices
- Include authentication requirements
- Document all error codes
- Provide cURL examples
- Show request/response schemas in JSON Schema format
```

### 4. `validation-rules.md`

Type-specific validation checks:

```markdown
# API Documentation Validation Rules

## Frontmatter Validation
- ✅ `endpoint` must start with `/`
- ✅ `method` must be GET, POST, PUT, DELETE, or PATCH
- ✅ `service` must be non-empty
- ✅ `version` must follow semver (x.y.z)

## Content Validation
- ✅ Must have Request section
- ✅ Must have Response section
- ✅ Must have Examples section
- ✅ Examples must include cURL or equivalent

## Link Validation
- ✅ Related API endpoints must exist
- ✅ Service documentation must be linked
```

### 5. `index-config.json`

Index generation configuration:

```json
{
  "index_file": "docs/api/README.md",
  "organization": "hierarchical",
  "group_by": ["service", "version"],
  "sort_by": "endpoint",
  "sort_order": "asc",
  "entry_template": "- [**{{method}} {{endpoint}}**]({{relative_path}}) - {{title}}",
  "section_template": "## {{group_name}}"
}
```

**Index organization modes**:
- **flat**: Simple list sorted by `sort_by` field
- **hierarchical**: Multi-level grouping using `group_by` array

**Template variables**: All frontmatter fields plus:
- `{{relative_path}}` - Relative path to document
- `{{filename}}` - File name
- `{{group_name}}` - Current group value (hierarchical only)
- `{{description_short}}` - Truncated description (100 chars)

## Operations

### Write Operation (doc-writer)

Create or update documentation with automatic validation and indexing.

**Single document**:
```bash
/fractary-docs:write api
```

**Batch operation**:
```bash
/fractary-docs:write api docs/api/**/*.md --batch
```

**Pipeline**:
1. Classify doc_type (if not provided)
2. Load type context (5 files)
3. Render template with context
4. Validate document (unless `--skip-validation`)
5. Update index (unless `--skip-index`)

### Validate Operation (doc-validator)

Validate documentation against schema and quality rules.

**Validation checks**:
- Frontmatter structure (JSON Schema validation)
- Required sections (per standards.md)
- Custom rules (per validation-rules.md)
- Link validity (internal references)
- Markdown linting (optional)

**Example**:
```bash
/fractary-docs:validate docs/api/user-login/README.md
```

### Classify Operation (doc-classifier)

Auto-detect document type from path or content.

**Classification methods**:
1. **Path-based**: `docs/{doc_type}/` → detect from directory
2. **Content-based**: Read frontmatter `fractary_doc_type` field
3. **Fallback**: `_untyped` if unable to determine

**Example**:
```bash
# Automatically detects "api" from path
/fractary-docs:write docs/api/new-endpoint/README.md
```

### List Operation (doc-lister)

List and filter documentation with various output formats.

**Output formats**:
- **table**: ASCII table (default)
- **json**: Structured JSON
- **markdown**: Formatted markdown with links

**Filters**:
- `--doc-type <type>`: Filter by document type
- `--status <status>`: Filter by status (draft, published, deprecated)
- `--limit <n>`: Limit results

**Example**:
```bash
/fractary-docs:list --doc-type api --status published --format markdown
```

### Audit Operation (docs-director)

Analyze documentation across project to identify issues and gaps.

**Analysis**:
- Count documents by type and status
- Identify missing indices
- Find validation issues
- Detect missing `fractary_doc_type` fields

**Output**:
```
═══════════════════════════════════════
DOCUMENTATION AUDIT REPORT
═══════════════════════════════════════

Summary:
  Total Documents: 156
  Document Types: 8
  Missing Indices: 2
  Validation Issues: 5

By Type:
  api             45 documents
  adr             32 documents
  dataset         18 documents
  ...

Issues Found:
  ⚠️  docs/api/deprecated/: Missing index
  ❌ docs/dataset/metrics.md: Missing fractary_doc_type
```

## Coordination Skills

### docs-manager-skill (Single Document)

Orchestrates write → validate → index pipeline for single documents.

**Operations**:
- `write`: Create/update document with validation and indexing
- `validate`: Validate single document
- `index`: Update index for document's directory

**Example invocation**:
```
Use the @agent-fractary-docs:docs-manager agent with:
{
  "operation": "write",
  "file_path": "docs/api/user-login/README.md",
  "doc_type": "api",
  "context": {
    "title": "User Login",
    "endpoint": "/api/auth/login",
    "method": "POST",
    "service": "AuthService",
    "version": "1.0.0"
  }
}
```

### docs-director-skill (Multi-Document)

Handles batch operations with pattern matching and parallel execution.

**Operations**:
- `write-batch`: Create/update multiple documents in parallel
- `validate-batch`: Validate multiple documents
- `audit-docs`: Analyze documentation across project

**Parallel execution**:
- Concurrent processing (configurable max 10)
- File locking for safe concurrent access
- Aggregated results reporting

**Example**:
```bash
/fractary-docs:write api docs/api/**/README.md --batch
```

## Agent Invocation

Use declarative invocation to interact with the docs-manager agent:

```
Use the @agent-fractary-docs:docs-manager agent to write API documentation:
{
  "operation": "write",
  "doc_type": "api",
  "parameters": {
    "title": "User Login Endpoint",
    "endpoint": "/api/auth/login",
    "method": "POST",
    "service": "AuthService",
    "version": "1.0.0",
    "status": "draft",
    "overview": "Authenticates users with email/password credentials",
    "request_details": "...",
    "response_details": "...",
    "examples": "..."
  },
  "options": {
    "validate_after": true,
    "update_index": true
  }
}
```

## Adding New Document Types

To add a new custom document type (e.g., `changelog`) to your project:

### 1. Configure custom templates path

Add to `.fractary/config.yaml`:
```yaml
docs:
  custom_templates_path: .fractary/docs/templates/manifest.yaml
```

### 2. Create manifest and type directory

```bash
mkdir -p .fractary/docs/templates/changelog
```

Create `.fractary/docs/templates/manifest.yaml`:
```yaml
version: "1.0"
doc_types:
  - id: changelog
    display_name: Changelog
    description: Version history and release notes
    path: ./changelog
```

### 3. Create 3 type context files

**type.yaml** (type definition):
```yaml
id: changelog
display_name: Changelog
description: Version history and release notes

output_path: docs/changelog

file_naming:
  pattern: "CHANGELOG-{version}.md"
  slug_source: version

frontmatter:
  required_fields:
    - title
    - type
    - version
    - release_date
  optional_fields:
    - status
  defaults:
    type: changelog
    status: draft

structure:
  required_sections:
    - Added
    - Changed
    - Fixed
  optional_sections:
    - Deprecated
    - Removed
    - Security

status:
  allowed_values:
    - draft
    - released
  default: draft
```

**template.md** (Mustache template):
```markdown
# {{title}}

## Version {{version}} - {{release_date}}

### Added
{{added}}

### Changed
{{changed}}

### Fixed
{{fixed}}

{{#deprecated}}
### Deprecated
{{deprecated}}
{{/deprecated}}
```

**standards.md** (writing guidelines):
```markdown
# Changelog Standards

## Format
Follow Keep a Changelog format (keepachangelog.com)

## Sections
- Added (new features)
- Changed (changes to existing)
- Fixed (bug fixes)
- Deprecated (soon-to-be removed)
- Removed (removed features)
- Security (security fixes)

## Versioning
Use semantic versioning (semver.org)
```

### 4. Use immediately

```bash
# Verify type is loaded
fractary-core docs types

# Create a changelog
/fractary-docs:write changelog
```

The CLI and plugin automatically discover custom types from the configured manifest path.

## Migration from v1.x

### Frontmatter Field Change

**v1.x** (deprecated):
```yaml
---
type: api
---
```

**v2.0** (current):
```yaml
---
fractary_doc_type: api
---
```

### Command Changes

**v1.x**:
```bash
/fractary-docs:generate api "..."
/fractary-docs:manage-api "..."
```

**v2.0**:
```bash
/fractary-docs:write api
/fractary-docs:validate --doc-type api
```

### Skill Changes

**v1.x**: Type-specific skills
- `docs-manage-api` (500+ lines)
- `docs-manage-adr` (500+ lines)
- `docs-manage-architecture` (500+ lines)
- ... (11 skills total)

**v2.0**: Operation skills
- `doc-writer` (universal)
- `doc-validator` (universal)
- `doc-classifier` (universal)
- `doc-lister` (universal)

## Configuration

Configuration is stored in `.fractary/config.yaml`:

### Example Configuration

```yaml
docs:
  schema_version: "1.1"

  # Path to custom doc type templates (optional)
  # When set, CLI/SDK will load custom types from this manifest
  # in addition to the core types bundled with Fractary
  custom_templates_path: .fractary/docs/templates/manifest.yaml

  doc_types:
    adr:
      enabled: true
      path: docs/architecture/ADR
      auto_number: true
    api:
      enabled: true
      path: docs/api
      auto_update_index: true

  output_paths:
    documentation: docs
    adrs: docs/architecture/ADR
    api_docs: docs/api

  validation:
    lint_on_generate: true
    check_links_on_generate: false
    required_sections:
      adr: [Status, Context, Decision, Consequences]
      api: [Overview, Request, Response]
```

### Custom Templates Path

The `custom_templates_path` setting enables project-specific doc types:

1. **Core types** are always available (11 built-in types from `templates/docs/`)
2. **Custom types** are loaded from the specified manifest path
3. Custom types can **override** core types by using the same ID

Example custom manifest at `.fractary/docs/templates/manifest.yaml`:
```yaml
version: "1.0"
doc_types:
  - id: runbook
    display_name: Runbook
    path: ./runbook
  - id: adr  # Overrides core ADR type
    display_name: Custom ADR
    path: ./adr
```

## Frontmatter Schema

All documents use this standard frontmatter format:

```yaml
---
title: "Document Title"
fractary_doc_type: api
status: draft
date: 2025-01-15
updated: 2025-01-16
author: Claude Code
tags: [api, authentication]
version: 1.0.0
codex_sync: true
# Type-specific fields (e.g., for API docs):
endpoint: /api/auth/login
method: POST
service: AuthService
---
```

**Standard fields**:
- `title`: Document title (required)
- `fractary_doc_type`: Document type (required)
- `status`: draft | published | deprecated (required)
- `date`: Creation date (auto-generated)
- `updated`: Last update date (auto-maintained)
- `version`: Semantic version (required for some types)
- `author`: Author name
- `tags`: Array of tags for categorization
- `codex_sync`: Enable codex synchronization

**Type-specific fields**: Defined in each type's `schema.json`

## Commands

- `/fractary-docs:write <doc_type>` - Create or update documentation
- `/fractary-docs:validate [path]` - Validate documentation
- `/fractary-docs:list [options]` - List and filter documentation
- `/fractary-docs:audit [directory]` - Audit documentation quality
- `/fractary-docs:check-consistency` - Check documentation consistency

See individual command files in `commands/` for detailed usage.

## Global Arguments

All commands support the `--context` argument for passing additional instructions:

```bash
--context "<text>"
```

This argument is always optional and appears as the final argument. When provided, agents prepend the context as additional instructions to their workflow.

**Examples:**

```bash
# Focus validation on specific aspects
/fractary-docs:validate --context "Be strict about code examples"

# Guide documentation generation
/fractary-docs:write api --context "Focus on error handling and include rate limiting info"

# Customize audit behavior
/fractary-docs:audit --context "Focus on structure, ignore minor style issues"
```

See [Context Argument Standard](../../docs/plugin-development/context-argument-standard.md) for full documentation.

## Integration

### With fractary-codex

All documents include `codex_sync: true` in frontmatter, enabling automatic synchronization with the codex knowledge base.

### With FABER Workflows

FABER workflows use docs plugin for:
- Specifications (Architect phase)
- Test reports (Evaluate phase)
- Deployment records (Release phase)

### With fractary-repo

Documentation changes can be automatically committed using fractary-repo plugin integration.

## Best Practices

1. **Always use `fractary_doc_type`**: Required field (not `type`)
2. **Let classification happen**: Path-based detection works for `docs/{doc_type}/`
3. **Use batch operations**: Process multiple docs efficiently with `--batch`
4. **Leverage auto-indexing**: Indices update automatically after write operations
5. **Validate before commit**: Catch errors early
6. **Follow type standards**: Read `types/{doc_type}/standards.md` for guidelines
7. **Use hierarchical indices**: Configure in `index-config.json` for better organization
8. **Version control everything**: All docs and indices should be in git
9. **Keep type context updated**: Modify 5 files to change type behavior
10. **Use semantic versioning**: For schema, API, and other versioned docs

## Troubleshooting

### "Missing fractary_doc_type field"

Ensure frontmatter includes:
```yaml
fractary_doc_type: api
```

Not `type: api` (deprecated v1.x format).

### "Type context not found"

Verify the type exists:
```bash
# List all available types
fractary-core docs types

# Check if specific type is loaded
fractary-core docs type-info {doc_type} --json
```

For custom types, verify the type directory exists:
```bash
ls .fractary/docs/templates/{doc_type}/
# Should show: type.yaml, template.md, standards.md
```

### Validation failing

Check the type definition and standards:
```bash
# View type definition
fractary-core docs type-info {doc_type} --json

# Check standards file
cat templates/docs/{doc_type}/standards.md
```

### Custom types not loading

Verify `custom_templates_path` is set in `.fractary/config.yaml`:
```yaml
docs:
  custom_templates_path: .fractary/docs/templates/manifest.yaml
```

Check the manifest exists and is valid YAML:
```bash
cat .fractary/docs/templates/manifest.yaml
```

## File Structure

```
plugins/docs/                          # Plugin directory
├── .claude-plugin/
│   └── plugin.json                    # Plugin manifest (v3.1.0)
├── agents/                            # Agent definitions
│   ├── docs-audit.md
│   ├── docs-check-consistency.md
│   ├── docs-list.md
│   ├── docs-validate.md
│   └── docs-write.md                  # Main write agent (uses CLI)
├── skills/
│   ├── doc-type-selector/             # Type selection (uses CLI)
│   └── _shared/
│       └── lib/
│           ├── index-updater.sh
│           └── slugify.sh
└── commands/
    ├── write.md                       # /fractary-docs:write
    ├── validate.md                    # /fractary-docs:validate
    ├── list.md                        # /fractary-docs:list
    ├── audit.md                       # /fractary-docs:audit
    └── check-consistency.md

templates/docs/                        # Core doc types (in repo root)
├── manifest.yaml                      # Lists all 11 core types
├── adr/
│   ├── type.yaml                      # Type definition
│   ├── template.md                    # Mustache template
│   └── standards.md                   # Writing guidelines
├── api/
├── architecture/
├── audit/
├── changelog/
├── dataset/
├── etl/
├── guides/
├── infrastructure/
├── standards/
└── testing/

.fractary/docs/templates/              # Custom project types (optional)
├── manifest.yaml                      # Custom type manifest
└── {custom-type}/
    ├── type.yaml
    ├── template.md
    └── standards.md
```

## Version

**3.1.0** - SDK/CLI integration with language-agnostic templates

**Changes in 3.1.0**:
- Doc types moved from plugin skills to `templates/docs/` (YAML/Markdown format)
- SDK `DocTypeRegistry` loads types from templates directory
- CLI commands: `fractary-core docs types`, `fractary-core docs type-info`
- Custom types supported via `docs.custom_templates_path` in config
- Agents use CLI commands instead of loading skills directly

**2.0.0** - Architecture refactor (operation-specific skills with data-driven type context)

**Breaking changes from 1.x**:
- Frontmatter field: `type:` → `fractary_doc_type:`
- Skills: Type-specific → Operation-specific

## Contributing

To contribute:

1. **Add new core doc type**: Create 3 files in `templates/docs/{doc_type}/` (type.yaml, template.md, standards.md)
2. **Enhance SDK/CLI**: Modify `sdk/js/src/docs/` or `cli/src/commands/docs/`
3. **Improve agents**: Update agents in `plugins/docs/agents/`
4. **Test thoroughly**: Validate with `fractary-core docs types` and test document creation

## See Also

- **[SPEC-00032-docs-plugin-refactor.md](../../specs/SPEC-00032-docs-plugin-refactor.md)** - Detailed architecture specification
- **[CLAUDE.md](../../CLAUDE.md)** - Plugin development standards
- **[fractary-codex](../codex/)** - Knowledge management integration
- **[fractary-repo](../repo/)** - Source control integration

---

For more information:
- Plugin manifest: `.claude-plugin/plugin.json`
- Agent specification: `agents/docs-manager.md`
- Operation skills: `skills/doc-*/`
- Type context: `types/*/`
- Commands: `commands/*.md`
