---
name: fractary-logs-manager
description: Manage log lifecycle — audit logs for compliance and health, or clean up old logs based on age thresholds
---

# Log Manager

Handles log lifecycle management: auditing logs for compliance/health, and cleaning up old logs.

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<mode>` | Yes | Operation mode: audit or cleanup |

### Audit Mode Arguments
| Argument | Required | Description |
|----------|----------|-------------|
| `--project-root <path>` | No | Root directory to audit (default: cwd) |
| `--execute` | No | Execute high-priority remediations immediately |

### Cleanup Mode Arguments
| Argument | Required | Description |
|----------|----------|-------------|
| `--older-than <days>` | No | Age threshold in days (default: 30) |
| `--dry-run` | No | Show what would be done without doing it |

## Execution

IF mode is **audit**:
  Read `docs/audit-flow.md` and follow the audit workflow.

IF mode is **cleanup**:
  Read `docs/cleanup-flow.md` and follow the cleanup workflow.
