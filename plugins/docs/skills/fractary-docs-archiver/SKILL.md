---
name: fractary-docs-archiver
description: Archive documents with work-linking checks, cloud migration, and post-archive notifications
---

# Docs Archiver

Archives documents using the file plugin's configured sources. Checks work-linking requirements before archiving and posts notifications after.

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Document ID to archive |
| `--source <name>` | No | Override archive source from config |

## Critical Rules
1. ALWAYS use CLI: `fractary-core docs doc-archive <id> --json`
2. ALWAYS check work-linking requirements BEFORE archiving
3. If type has `work_linking.require_closed_for_archive`: verify work item is closed
4. NEVER archive without verifying the document exists first

## Workflow

### Step 1: Migrate local archives (if cloud storage configured)
```bash
fractary-core file migrate-archive --local-dir ".fractary/docs/archive" --cloud-prefix "archive/docs" --source docs --json
```

### Step 2: Get document info
```bash
fractary-core docs doc-get <id> --json
```

### Step 3: Load type configuration
```bash
fractary-core docs type-info <docType> --json
```

### Step 4: Pre-archive checks
If `work_linking.require_closed_for_archive` AND doc has work_id:
```bash
gh issue view <work_id> --json state,title
```
Refuse if not CLOSED.

### Step 5: Execute archive
```bash
fractary-core docs doc-archive <id> --json
```

### Step 6: Post-archive comment (if work-linked)
```bash
gh issue comment <work_id> --body "Document archived. Archive path: <path>, Checksum: <hash>"
```

### Step 7: Report results — archive path, checksum, work-linking actions taken.
