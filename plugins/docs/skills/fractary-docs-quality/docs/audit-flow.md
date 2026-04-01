# Documentation Audit Flow

Read-only audit of documentation across a project.

## Critical Rules
1. Load type-specific skills for validation rules
2. Scan for missing fractary_doc_type fields
3. Check for missing indices per type's index-config.json
4. Report actionable issues with suggested fixes
5. NEVER modify files during audit

## Workflow

### Step 1: Scan all markdown files in target directory

### Step 2: For each document, detect type from frontmatter

### Step 3: Load type-specific validation context
For each detected type, load from skills/doc-type-{type}/:
- schema.json — frontmatter validation
- validation-rules.md — type-specific quality checks
- index-config.json — index compliance
- standards.md — guideline compliance

### Step 4: Identify issues
- Missing fields, broken links, validation errors
- Missing type assignments
- Index compliance issues

### Step 5: Generate audit report
- Total document count, by type and status
- Issues found with severity
- Suggested next steps
