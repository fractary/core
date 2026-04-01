# Document Writing Flow

## Critical Rules
1. ALWAYS use CLI to get type info: `fractary-core docs type-info <type> --json`
2. ALWAYS use CLI to create docs: `fractary-core docs doc-create --doc-type <type>`
3. When UPDATING, first get existing doc: `fractary-core docs doc-get <id> --json`
4. ALWAYS include --doc-type flag when creating
5. VALIDATE content matches type's required sections and frontmatter

## For NEW Documents

### Step 1: Determine document type
- If `--doc-type` specified: use that type
- If not: use fractary-docs-doc-type-selector skill
- If user insists on no type: create basic markdown

### Step 2: Get type definition
```bash
fractary-core docs type-info <type> --json
```
Parse for: template, standards, frontmatter.requiredFields, frontmatter.defaults, structure.requiredSections

### Step 3: Generate document content
- Use template as structure guide
- Apply standards for quality
- Ensure required sections present
- Fill in frontmatter fields

### Step 4: Create via CLI
```bash
fractary-core docs doc-create <id> --doc-type <type> --title "<title>" --content "<body>" --json
```

### Step 5: Verify creation and report file path

## For UPDATING Documents

### Step 1: Get existing document
```bash
fractary-core docs doc-get <id> --json
```

### Step 2: Extract existing docType — do NOT change unless explicitly requested

### Step 3: Get type definition
```bash
fractary-core docs type-info <type> --json
```

### Step 4: Update content following type standards, preserving existing structure

### Step 5: Update via CLI
```bash
fractary-core docs doc-update <id> --content "<new_content>" --json
```

## Document Types
Get current list: `fractary-core docs type-list --json`

Core types: adr, api, architecture, audit, changelog, dataset, etl, guides, infrastructure, standards, testing
Spec types: spec-basic, spec-feature, spec-bug, spec-api, spec-infrastructure

## Output Format
Return JSON with: status (success/warning/failure), operation, doc_id, doc_type, file_path, work_id, summary, details
