---
name: fractary-docs-quality
description: Check documentation quality — audit docs for gaps, validate against type rules, or check consistency with code changes
---

# Docs Quality

Multi-mode skill for read-only documentation quality checks. Supports three modes:

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<mode>` | Yes | Operation: audit, validate, or check-consistency |

### Audit Mode
| Argument | Description |
|----------|-------------|
| `[directory]` | Directory to audit (default: docs/) |
| `--doc-type <type>` | Filter to specific type |

### Validate Mode
| Argument | Description |
|----------|-------------|
| `[file_path\|pattern]` | File or pattern to validate |
| `[doc_type]` | Document type (auto-detected if omitted) |

### Check-Consistency Mode
| Argument | Description |
|----------|-------------|
| `--fix` | Generate and apply update suggestions |
| `--targets` | Comma-separated target docs (default: CLAUDE.md,README.md) |
| `--base` | Base git ref (default: main) |
| `--head` | Head git ref (default: HEAD) |
| `--mode` | confirm, auto, or dry-run (default: confirm) |

## Execution

IF mode is **audit**:
  Read `docs/audit-flow.md` and follow the audit workflow.

IF mode is **validate**:
  Read `docs/validate-flow.md` and follow the validation workflow.

IF mode is **check-consistency**:
  Read `docs/consistency-flow.md` and follow the consistency workflow.
