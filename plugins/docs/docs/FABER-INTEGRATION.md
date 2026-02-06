# FABER Integration — Specs as Doc Types

## Overview

Specifications are now managed as doc types within the fractary-docs plugin. FABER workflows interact with specs through the standard docs CLI commands rather than a separate spec plugin.

## Configuration

```toml
# .faber.config.toml

[workflow.architect]
  generate_doc = true
  doc_type = "auto"            # Auto-select based on work type (see mapping below)
  # Or specify explicitly:
  # doc_type = "spec-feature"

[workflow.evaluate]
  validate_doc = true
  fulfillment_validation = true   # Run implementation fulfillment checks

[workflow.release]
  archive_doc = true
  check_docs_updated = "warn"    # "warn" | "error" | "skip"
```

## Work Type to Doc Type Mapping

When `doc_type = "auto"`, FABER selects the spec type based on work classification:

| Work Type | Doc Type | Template |
|-----------|----------|----------|
| feature | spec-feature | Comprehensive feature spec |
| bug | spec-bug | Bug investigation and fix spec |
| api | spec-api | API design spec |
| infrastructure | spec-infrastructure | Infrastructure change spec |
| chore | spec-basic | Minimal spec |
| patch | spec-basic | Minimal spec |

## Phase Integration

### Architect Phase — Generate Spec

```bash
# Auto-detect work type and create spec
fractary-core docs doc-create <spec-id> \
  --doc-type spec-feature \
  --title "Add CSV Export" \
  --content "<generated content>" \
  --json
```

The docs-writer agent handles:
- Template loading and content generation
- Work-linking (fetch issue data, comment on issue)
- Frontmatter population with work_id, status, etc.

### Evaluate Phase — Validate Spec

```bash
# Structural + quality validation
fractary-core docs doc-get <spec-id> --json

# Fulfillment validation (are acceptance criteria met?)
fractary-core docs doc-validate-fulfillment <spec-id> --json
```

If validation returns `partial` or `fail`, FABER loops back to Build phase.

### Release Phase — Archive Spec

```bash
# Archive to configured source
fractary-core docs doc-archive <spec-id> --json
```

The docs-archiver agent handles:
- Pre-archive check (require issue closed if configured)
- Archive to file source with checksum verification
- GitHub issue comment
- Local cleanup

## Migration from Spec Plugin

| Old Command (spec plugin) | New Command (docs plugin) |
|--------------------------|--------------------------|
| `fractary-core spec spec-create-file` | `fractary-core docs doc-create --doc-type spec-*` |
| `fractary-core spec spec-get` | `fractary-core docs doc-get` |
| `fractary-core spec spec-list` | `fractary-core docs doc-list` |
| `fractary-core spec spec-update` | `fractary-core docs doc-update` |
| `fractary-core spec spec-delete` | `fractary-core docs doc-delete` |
| `fractary-core spec spec-validate-check` | `fractary-core docs doc-validate-fulfillment` |
| `fractary-core spec spec-refine-scan` | `fractary-core docs doc-refine-scan` |
| `fractary-core spec spec-archive` | `fractary-core docs doc-archive` |
| `fractary-core spec template-list` | `fractary-core docs type-list` |

## Archive Configuration

Spec types use the file plugin's source/handler system for archival. Configure an archive source in `.fractary/config.yaml`:

```yaml
file:
  sources:
    archive:
      type: s3
      bucket: my-archive-bucket
      prefix: "archive/specs/"
      region: us-east-1
      auth:
        profile: default
```

Or for local archival:

```yaml
file:
  sources:
    archive:
      type: local
      basePath: ".fractary/archive/"
```

The spec type definitions reference this source by name in their `archive.source` field.
