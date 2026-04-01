# Documentation Validation Flow

Validates documents against type-specific rules and schemas. Read-only.

## Critical Rules
1. Auto-detect doc_type if not provided
2. Check frontmatter, required fields, and structure
3. Report errors AND warnings separately
4. NEVER modify files during validation

## Workflow

### Step 1: Detect doc_type from frontmatter if not provided

### Step 2: Load validation context from skills/doc-type-{doc_type}/
- schema.json — JSON Schema for frontmatter
- validation-rules.md — type-specific checks
- standards.md — guideline compliance

### Step 3: Validate
- Frontmatter: required fields present and valid
- Structure: required sections present
- Links: internal links resolve
- Schema: JSON schema validation
- Type-specific rules from validation-rules.md

### Step 4: Fulfillment validation (if type has fulfillment.enabled)
```bash
fractary-core docs doc-validate-fulfillment <id> --json
```
Checks: acceptance criteria, files modified, tests added, docs updated.
Include score (0-100%), status (pass/partial/fail), per-check details.

### Step 5: Return validation report
- Pass/fail status
- Errors (blocking) and warnings (non-blocking)
- Fulfillment score (if applicable)
