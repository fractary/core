---
model: claude-haiku-4-5
---

# /fractary-docs:validate

Validate documentation against type-specific rules and schemas.

## Usage

```bash
/fractary-docs:validate [file_path|pattern] [doc_type]
```

## Arguments

- `[file_path|pattern]` - File or pattern to validate (default: current directory)
- `[doc_type]` - Optional document type (auto-detected if omitted)

## Examples

```bash
# Validate single document (auto-detect type)
/fractary-docs:validate docs/api/user-login/README.md

# Validate single document with explicit type
/fractary-docs:validate docs/api/user-login/README.md api

# Validate all API documents
/fractary-docs:validate docs/api/**/*.md

# Validate all documentation
/fractary-docs:validate docs/

# Validate current directory
/fractary-docs:validate
```

## What This Does

**Single Document**:
1. Auto-detect doc_type (if not provided)
2. Load validation rules from types/{doc_type}/
3. Check frontmatter, required fields, structure
4. Report errors and warnings

**Batch Validation** (pattern or directory):
1. Expand pattern to file list
2. Validate each document in parallel
3. Aggregate results by error type
4. Report summary with counts

## Validation Checks

- **Frontmatter**: Required fields present and valid
- **Structure**: Required sections present
- **Links**: Internal links resolve correctly
- **Schema**: JSON schema validation (if dual-format type)
- **Markdown**: Linting for formatting issues
- **Type-Specific**: Rules from validation-rules.md

## Output

```
✅ Validation passed (docs/api/user-login/README.md)

Warnings (2):
  ⚠️  Missing recommended section: Examples
  ⚠️  Description is short (< 100 characters)
```

or

```
❌ Validation failed (docs/api/user-login/README.md)

Errors (3):
  ❌ Missing required field: endpoint
  ❌ Missing required field: method
  ❌ fractary_doc_type mismatch: expected 'api', found 'guide'

Warnings (1):
  ⚠️  No markdown headings found
```

## Related Commands

- `/fractary-docs:write` - Create or update documentation
- `/fractary-docs:audit` - Audit all documentation
- `/fractary-docs:list` - List documentation files

---

Use the @agent-fractary-docs:docs-manager agent to handle this validation request.
