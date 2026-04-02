# Work Item Integration

Loaded when --work-id is provided or auto-detected from git branch.

## Load Work Context (before document creation/update)

### Step 1: Fetch issue context
```bash
fractary-core work issue-fetch <work_id> --json
```
Parse: title, description, state, labels, comments (workflow history).
Use this context to inform document content.

### Step 2: Auto-detect from branch (if --work-id not provided)
```bash
git branch --show-current
```
Parse issue number from branch prefix (e.g., `feat/123-name` → work_id=123).

## Update Work Context (after completion)

### Step 1: Determine final status — success, warning, or failure

### Step 2: Post status comment
```bash
fractary-core work issue-comment <work_id> --body "<comment>"
```

Comment format:
```
## {emoji} Docs Writer {Status}

**Timestamp:** <ISO timestamp>

### Summary
<Created|Updated> <doc_type> document: <doc_id>

### Details
- **Operation**: <create|update>
- **Type**: <doc_type>
- **Path**: <file_path>
- **Status**: <status>
```

Status emoji: success → check, warning → warning sign, failure → X

### CRITICAL: Even on failure, MUST still post the status comment before returning.
