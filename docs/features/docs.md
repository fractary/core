# Documentation Management

Type-aware documentation system with creation, validation, refinement, archival, and consistency checking. Supports 16+ document types with per-type schemas, templates, and validation rules.

## Contents

- [Document Types](#document-types)
- [Configuration](#configuration) - config.yaml reference, storage handlers, custom templates
- [Document CRUD Operations](#document-crud-operations) - create, get, update, delete, list, search
- [Quality Operations](#quality-operations) - write, validate, refine, audit, check consistency
- [Archive Operations](#archive-operations) - archive documents to configured storage
- [Type Management](#type-management) - list types, type info
- [Agents](#agents) - writer, validator, refiner, auditor, consistency-checker, archiver
- [Types & Schemas](#types--schemas) - TypeScript interfaces
- [Error Handling](#error-handling)

---

## Document Types

### Built-in Types

| Type | Description | Output Path |
|------|-------------|-------------|
| `adr` | Architecture Decision Record | `docs/decisions` |
| `api` | API Documentation | `docs/api` |
| `architecture` | Architecture Overview | `docs/architecture` |
| `audit` | Audit Documentation | `docs/audit` |
| `changelog` | Change Log | `docs/` |
| `dataset` | Data Documentation | `docs/datasets` |
| `etl` | ETL Pipeline Documentation | `docs/etl` |
| `guides` | User Guides | `docs/guides` |
| `infrastructure` | Infrastructure Docs | `docs/infrastructure` |
| `standards` | Standards & Best Practices | `docs/standards` |
| `testing` | Test Documentation | `docs/testing` |
| `spec-basic` | Basic Specification | `docs/specs` |
| `spec-feature` | Feature Specification | `docs/specs` |
| `spec-bug` | Bug Specification | `docs/specs` |
| `spec-api` | API Specification | `docs/specs` |
| `spec-infrastructure` | Infrastructure Specification | `docs/specs` |

Each type defines its own template, frontmatter fields, required sections, status values, naming patterns, and validation rules.

## Configuration

The `docs:` section of `.fractary/config.yaml` controls documentation management. Docs use the [file plugin](./file.md) for storage through named handler references.

### Minimal Configuration

```yaml
docs:
  schema_version: "1.1"
  storage:
    file_handlers:
      - name: default
        write: docs-write
        archive: docs-archive
```

The `write` and `archive` values reference named handlers in the `file:` section.

### Full Reference

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `schema_version` | string | Yes | `"1.1"` | Configuration version |
| `custom_templates_path` | string | No | `docs/templates/manifest.yaml` | Path to custom doc type templates |
| `storage` | object | No | - | Storage handler mapping |
| `hooks` | object | No | - | Document lifecycle hooks |
| `doc_types` | object | No | - | Doc type overrides/extensions |
| `output_paths` | object | No | - | Custom output paths per type |
| `templates` | object | No | - | Template customizations |
| `frontmatter` | object | No | - | Frontmatter field configuration |
| `validation` | object | No | - | Validation rules per type |
| `linking` | object | No | - | Cross-linking configuration |

### Storage Configuration

```yaml
docs:
  storage:
    file_handlers:
      - name: default
        write: docs-write       # References file.handlers.docs-write
        archive: docs-archive   # References file.handlers.docs-archive
```

### Custom Templates

Document types are defined in `templates/docs/` (built-in). To add custom types or override built-in types:

```yaml
docs:
  custom_templates_path: .fractary/docs/templates/manifest.yaml
```

---

## Document CRUD Operations

### Quick Reference

| Operation | SDK | CLI | MCP | Plugin |
|-----------|-----|-----|-----|--------|
| [Create](#create-document) | [`createDoc(id, content, meta)`](#create-document-sdk) | [`doc-create`](#create-document-cli) | [`docs_create`](#create-document-mcp) | [`/doc-create`](#create-document-plugin) |
| [Get](#get-document) | [`getDoc(id)`](#get-document-sdk) | [`doc-get`](#get-document-cli) | [`docs_read`](#get-document-mcp) | [`/doc-get`](#get-document-plugin) |
| [Update](#update-document) | [`updateDoc(id, updates)`](#update-document-sdk) | [`doc-update`](#update-document-cli) | [`docs_update`](#update-document-mcp) | [`/doc-update`](#update-document-plugin) |
| [Delete](#delete-document) | [`deleteDoc(id)`](#delete-document-sdk) | [`doc-delete`](#delete-document-cli) | [`docs_delete`](#delete-document-mcp) | [`/doc-delete`](#delete-document-plugin) |
| [List](#list-documents) | [`listDocs(opts)`](#list-documents-sdk) | [`doc-list`](#list-documents-cli) | [`docs_list`](#list-documents-mcp) | [`/doc-list`](#list-documents-plugin) |
| [Search](#search-documents) | [`searchDocs(query)`](#search-documents-sdk) | [`doc-search`](#search-documents-cli) | [`docs_search`](#search-documents-mcp) | [`/doc-search`](#search-documents-plugin) |

> CLI commands are prefixed with `fractary-core docs` (e.g., `fractary-core docs doc-create`).

---

### Create Document

#### Create Document: SDK

```typescript
const doc = await docsManager.createDoc(
  'user-guide',
  '# User Guide\n\nWelcome...',
  { title: 'User Guide', authors: ['dev1'], tags: ['guide'] },
  'markdown'
);
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Unique document ID |
| `content` | string | Yes | Document content |
| `metadata` | DocMetadata | Yes | Title, authors, tags, etc. |
| `format` | DocFormat | No | `markdown`, `html`, `pdf`, `text` (default: `markdown`) |

**Returns:** `Promise<Doc>`

#### Create Document: CLI

```bash
fractary-core docs doc-create user-guide --title "User Guide" --content "# Welcome"
fractary-core docs doc-create adr-001 \
  --title "Use PostgreSQL" --content "## Context..." \
  --doc-type adr --tags "architecture,database"
```

| Flag | Required | Description |
|------|----------|-------------|
| `--title <title>` | Yes | Document title |
| `--content <text>` | Yes | Document content |
| `--doc-type <type>` | No | Document type (e.g., `adr`, `api`) |
| `--tags <tags>` | No | Comma-separated tags |
| `--category <cat>` | No | Document category |
| `--description <desc>` | No | Document description |
| `--status <status>` | No | Initial status |
| `--format <format>` | No | Format (default: `markdown`) |
| `--json` | No | Output as JSON |

#### Create Document: MCP

Tool: `fractary_docs_create`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Document ID |
| `title` | string | Yes | Document title |
| `content` | string | Yes | Document content |
| `type` | string | No | Document type |
| `tags` | string[] | No | Document tags |

#### Create Document: Plugin

Command: `/fractary-docs-doc-create`

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Document ID |
| `--title <title>` | Yes | Document title |
| `--content <text>` | Yes | Document content |
| `--doc-type <type>` | No | Document type |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI (`fractary-core docs doc-create`). No agent delegation.

---

### Get Document

#### Get Document: SDK

```typescript
const doc = await docsManager.getDoc('user-guide');
```

**Returns:** `Promise<Doc | null>`

#### Get Document: CLI

```bash
fractary-core docs doc-get user-guide
fractary-core docs doc-get user-guide --json
```

#### Get Document: MCP

Tool: `fractary_docs_read` with `{ "id": "user-guide" }`

#### Get Document: Plugin

Command: `/fractary-docs-doc-get`

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Document ID |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI. No agent delegation.

---

### Update Document

#### Update Document: SDK

```typescript
const updated = await docsManager.updateDoc('user-guide', {
  content: '# Updated Guide\n\nNew content...',
  metadata: { description: 'Updated guide' }
});
```

#### Update Document: CLI

```bash
fractary-core docs doc-update user-guide --content "# Updated..." --title "User Guide v2"
```

| Flag | Description |
|------|-------------|
| `--content <text>` | New content (required) |
| `--title <title>` | New title |
| `--tags <tags>` | New tags |
| `--category <cat>` | New category |
| `--description <desc>` | New description |
| `--json` | Output as JSON |

#### Update Document: MCP

Tool: `fractary_docs_update`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Document ID |
| `title` | string | No | New title |
| `content` | string | No | New content |
| `tags` | string[] | No | New tags |

#### Update Document: Plugin

Command: `/fractary-docs-doc-update`

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Document ID |
| `--content <text>` | Yes | New content |
| `--title <title>` | No | New title |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI. No agent delegation.

---

### Delete Document

#### Delete Document: SDK

```typescript
await docsManager.deleteDoc('old-draft');
```

#### Delete Document: CLI

```bash
fractary-core docs doc-delete old-draft
```

#### Delete Document: MCP

Tool: `fractary_docs_delete` with `{ "id": "old-draft" }`

#### Delete Document: Plugin

Command: `/fractary-docs-doc-delete`

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Document ID |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI. No agent delegation.

---

### List Documents

#### List Documents: SDK

```typescript
const guides = await docsManager.listDocs({ tags: ['guide'] });
```

#### List Documents: CLI

```bash
fractary-core docs doc-list
fractary-core docs doc-list --category api --tags "v2" --json
```

| Flag | Description |
|------|-------------|
| `--category <cat>` | Filter by category |
| `--tags <tags>` | Comma-separated tag filter |
| `--format <format>` | Filter by format |
| `--json` | Output as JSON |

#### List Documents: MCP

Tool: `fractary_docs_list`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tags` | string[] | No | Filter by tags |
| `author` | string | No | Filter by author |
| `limit` | number | No | Max results |

#### List Documents: Plugin

Command: `/fractary-docs-doc-list`

| Argument | Required | Description |
|----------|----------|-------------|
| `--category <cat>` | No | Filter by category |
| `--tags <tags>` | No | Comma-separated tags |
| `--format <format>` | No | Filter by format |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI. No agent delegation.

---

### Search Documents

#### Search Documents: SDK

```typescript
const results = await docsManager.searchDocs({
  text: 'authentication',
  tags: ['api']
});
```

#### Search Documents: CLI

```bash
fractary-core docs doc-search --text "authentication"
fractary-core docs doc-search --doc-type adr --category architecture
```

| Flag | Description |
|------|-------------|
| `--text <query>` | Full-text search |
| `--tags <tags>` | Filter by tags |
| `--author <author>` | Filter by author |
| `--category <cat>` | Filter by category |
| `--doc-type <type>` | Filter by document type |
| `--limit <n>` | Max results (default: 10) |
| `--json` | Output as JSON |

#### Search Documents: MCP

Tool: `fractary_docs_search`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | No | Search text |
| `tags` | string[] | No | Filter by tags |
| `author` | string | No | Filter by author |
| `limit` | number | No | Max results |

#### Search Documents: Plugin

Command: `/fractary-docs-doc-search`

| Argument | Required | Description |
|----------|----------|-------------|
| `--text <query>` | No | Full-text search |
| `--tags <tags>` | No | Filter by tags |
| `--doc-type <type>` | No | Filter by type |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI. No agent delegation.

---

## Quality Operations

### Quick Reference

| Operation | SDK | CLI | Plugin |
|-----------|-----|-----|--------|
| [Write](#write-documentation) | - | - | [`/docs-write`](#write-documentation-plugin) |
| [Validate](#validate-documentation) | [`validateDoc(id)`](#validate-documentation-sdk) | - | [`/docs-validate`](#validate-documentation-plugin) |
| [Refine](#refine-documentation) | - | [`doc-refine-scan`](#refine-documentation-cli) | [`/docs-refine`](#refine-documentation-plugin) |
| [Audit](#audit-documentation) | - | - | [`/docs-audit`](#audit-documentation-plugin) |
| [Check Consistency](#check-consistency) | [`checkConsistency()`](#check-consistency-sdk) | - | [`/docs-check-consistency`](#check-consistency-plugin) |

---

### Write Documentation

Create or update documentation with AI assistance, type-aware templates, and validation.

#### Write Documentation: Plugin

Command: `/fractary-docs-write`

| Argument | Required | Description |
|----------|----------|-------------|
| `<doc_type>` | Yes | Document type (e.g., `adr`, `api`, `guides`) |
| `[file_path]` | No | Specific file path |
| `--work-id <number>` | No | Link to work item |
| `--skip-validation` | No | Skip post-write validation |
| `--batch` | No | Batch mode for multiple docs |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Delegates to **`fractary-docs-writer`** agent. The agent uses the CLI and SDK to create type-appropriate documentation with proper templates and validation.

**Agent triggers:** "write docs", "create documentation", "document this"

---

### Validate Documentation

Validate documents against type-specific rules and schemas.

#### Validate Documentation: SDK

```typescript
const result = await docsManager.validateDoc('api-spec');
if (!result.valid) {
  result.errors.forEach(e => console.log(`Error: ${e.message}`));
}
```

#### Validate Documentation: Plugin

Command: `/fractary-docs-validate`

| Argument | Required | Description |
|----------|----------|-------------|
| `[file_path\|pattern]` | No | File or glob pattern to validate |
| `[doc_type]` | No | Document type |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Delegates to **`fractary-docs-validator`** agent. The agent validates documents against type-specific rules, frontmatter requirements, and structural schemas.

**Agent triggers:** "validate docs", "check doc format", "lint documentation"

---

### Refine Documentation

Scan documents for gaps and generate refinement questions.

#### Refine Documentation: CLI

```bash
fractary-core docs doc-refine-scan user-guide
```

Output identifies missing required sections, placeholder text (TBD, TODO), empty sections, and unchecked acceptance criteria.

#### Refine Documentation: Plugin

Command: `/fractary-docs-refine`

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Document ID to refine |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Delegates to **`fractary-docs-refiner`** agent. The agent scans for gaps, generates targeted questions, and applies improvements through interactive conversation.

**Agent triggers:** "refine doc", "improve spec", "find gaps", "tighten spec"

---

### Audit Documentation

Audit documentation quality across a project to find gaps and issues.

#### Audit Documentation: Plugin

Command: `/fractary-docs-audit`

| Argument | Required | Description |
|----------|----------|-------------|
| `[directory]` | No | Directory to audit |
| `--doc-type <type>` | No | Limit to specific type |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Delegates to **`fractary-docs-auditor`** agent. The agent scans documentation across the project, identifies quality issues, gaps, and stale content.

**Agent triggers:** "audit docs", "check documentation", "find doc issues", "documentation quality"

---

### Check Consistency

Check if documentation is consistent with recent code changes.

#### Check Consistency: SDK

```typescript
const result = await docsManager.checkConsistency({
  sourceDirs: ['src/'],
  docTypes: ['api']
});
```

#### Check Consistency: Plugin

Command: `/fractary-docs-check-consistency`

| Argument | Required | Description |
|----------|----------|-------------|
| `--fix` | No | Attempt to fix inconsistencies |
| `--targets <files>` | No | Specific files to check |
| `--base <ref>` | No | Git ref to compare against |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Delegates to **`fractary-docs-consistency-checker`** agent. The agent compares documentation against recent code changes and identifies drift.

**Agent triggers:** "docs out of date", "stale documentation", "sync docs"

---

## Archive Operations

### Archive Document

Archive a document to configured storage.

#### Archive Document: Plugin

Command: `/fractary-docs-archive`

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Document ID |
| `--source <name>` | No | Override archive source |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Delegates to **`fractary-docs-archiver`** agent. The agent uploads the document to the configured archive source, verifies the checksum, and handles cleanup.

**Agent triggers:** "archive doc", "move to archive", "clean up old docs"

---

## Type Management

### Quick Reference

| Operation | CLI | Plugin |
|-----------|-----|--------|
| [List Types](#list-document-types) | [`docs type-list`](#list-document-types-cli) | [`/docs-type-list`](#list-document-types-plugin) |
| [Type Info](#get-document-type-info) | [`docs type-info`](#get-document-type-info-cli) | [`/docs-type-info`](#get-document-type-info-plugin) |

---

### List Document Types

#### List Document Types: CLI

```bash
fractary-core docs type-list
```

#### List Document Types: Plugin

Command: `/fractary-docs-type-list`

**Delegation:** Executes directly via CLI. No agent delegation.

---

### Get Document Type Info

Get detailed information about a document type including template, frontmatter fields, required sections, and status values.

#### Get Document Type Info: CLI

```bash
fractary-core docs type-info adr
fractary-core docs type-info adr --template    # show template content
fractary-core docs type-info adr --standards   # show documentation standards
```

| Flag | Description |
|------|-------------|
| `--template` | Show document template |
| `--standards` | Show documentation standards |
| `--json` | Output as JSON |

#### Get Document Type Info: Plugin

Command: `/fractary-docs-type-info`

| Argument | Required | Description |
|----------|----------|-------------|
| `<type>` | Yes | Document type ID |
| `--template` | No | Show template |
| `--standards` | No | Show standards |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI. No agent delegation.

---

## Agents

### fractary-docs-writer

Creates or updates documentation using type-aware templates, the CLI, and SDK. Handles proper formatting, frontmatter, and post-write validation.

**Invoked by:** `/fractary-docs-write` command

**Triggers proactively:** "write docs", "create documentation", "document this"

### fractary-docs-validator

Validates documentation against type-specific rules including frontmatter requirements, required sections, and structural schemas.

**Invoked by:** `/fractary-docs-validate` command

**Triggers proactively:** "validate docs", "check doc format", "lint documentation"

### fractary-docs-refiner

Scans documents for gaps (missing sections, placeholder text, empty sections) and generates targeted refinement questions through interactive conversation.

**Invoked by:** `/fractary-docs-refine` command

**Triggers proactively:** "refine doc", "improve spec", "find gaps", "tighten spec"

### fractary-docs-auditor

Audits documentation across a project, identifying quality issues, gaps, and stale content. Generates reports with recommendations.

**Invoked by:** `/fractary-docs-audit` command

**Triggers proactively:** "audit docs", "check documentation", "find doc issues"

### fractary-docs-consistency-checker

Compares high-level documentation (CLAUDE.md, README.md) against recent code changes to identify drift and inconsistencies.

**Invoked by:** `/fractary-docs-check-consistency` command

**Triggers proactively:** "docs out of date", "stale documentation", "sync docs"

### fractary-docs-archiver

Archives documents to configured storage sources, verifies checksums, and handles cleanup.

**Invoked by:** `/fractary-docs-archive` command

**Triggers proactively:** "archive doc", "move to archive", "clean up old docs"

---

## Types & Schemas

```typescript
interface Doc {
  id: string;
  content: string;
  format: DocFormat;
  metadata: DocMetadata;
  path: string;
  createdAt: string;
  updatedAt: string;
}

type DocFormat = 'markdown' | 'html' | 'pdf' | 'text';

interface DocMetadata {
  title: string;
  description?: string;
  authors?: string[];
  tags?: string[];
  version?: string;
  status?: 'draft' | 'review' | 'published' | 'archived';
}

interface DocSearchQuery {
  text?: string;
  tags?: string[];
  author?: string;
  format?: DocFormat;
  status?: string;
}

interface DocValidationResult {
  valid: boolean;
  errors: Array<{ code: string; message: string; line?: number }>;
  warnings: Array<{ code: string; message: string; line?: number }>;
}
```

---

## Error Handling

### SDK Errors

```typescript
import { DocsError } from '@fractary/core';

try {
  await docsManager.getDoc('nonexistent');
} catch (error) {
  if (error instanceof DocsError) {
    console.error('Documentation error:', error.message);
  }
}
```

### CLI Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | General error |
| `3` | Resource not found / validation failure |

### MCP Error Codes

| Code | Description |
|------|-------------|
| `NOT_FOUND` | Document not found |
| `VALIDATION_ERROR` | Invalid parameters |
| `ALREADY_EXISTS` | Document ID already exists |
