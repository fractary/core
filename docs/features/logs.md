# Log Management

Session and operational logging with type-based classification, session capture, search, analysis, and retention management.

## Contents

- [Log Types](#log-types)
- [Configuration](#configuration) - config.yaml reference, storage handlers, retention, session settings
- [Log CRUD Operations](#log-crud-operations) - write, read, list, search, delete
- [Session Capture](#session-capture) - start and stop session recording
- [Maintenance Operations](#maintenance-operations) - archive, cleanup, validate, analyze, audit
- [Type Management](#type-management) - list types, type info
- [Agents](#agents) - analyze, audit, cleanup, log
- [Types & Schemas](#types--schemas) - TypeScript interfaces
- [Error Handling](#error-handling)

---

## Log Types

| Type | Description |
|------|-------------|
| `session` | Development session logs |
| `build` | Build process logs |
| `deployment` | Deployment logs |
| `test` | Test execution logs |
| `debug` | Debug investigation logs |
| `audit` | Audit trail logs |
| `operational` | Operational logs |
| `workflow` | FABER workflow logs |

Custom log types can be added via `custom_templates_path` in configuration.

## Configuration

The `logs:` section of `.fractary/config.yaml` controls log management. Logs use the [file plugin](./file.md) for storage through named handler references.

### Minimal Configuration

```yaml
logs:
  schema_version: "2.0"
  storage:
    file_handlers:
      - name: default
        write: logs-write
        archive: logs-archive
```

The `write` and `archive` values reference named handlers defined in the `file:` section (e.g., `logs-write` and `logs-archive`).

### Full Reference

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `schema_version` | string | Yes | `"2.0"` | Configuration version |
| `custom_templates_path` | string | No | - | Path to custom log type templates |
| `storage` | object | No | - | Storage handler mapping |
| `retention` | object | No | - | Log retention policies |
| `session_logging` | object | No | - | Session capture settings |
| `auto_backup` | object | No | - | Automatic backup configuration |
| `summarization` | object | No | - | Log summarization settings |
| `archive` | object | No | - | Archive behavior configuration |
| `search` | object | No | - | Search and indexing settings |
| `integration` | object | No | - | External integrations |
| `docs_integration` | object | No | - | Integration with docs plugin |

### Storage Configuration

Maps log operations to file plugin handlers:

```yaml
logs:
  storage:
    file_handlers:
      - name: default          # Fallback handler
        write: logs-write      # References file.handlers.logs-write
        archive: logs-archive  # References file.handlers.logs-archive
```

### Session Logging

```yaml
logs:
  session_logging:
    enabled: true
    redact_sensitive: true
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `enabled` | boolean | `true` | Enable session capture |
| `redact_sensitive` | boolean | `true` | Redact tokens, passwords, emails, IPs |

### Retention

```yaml
logs:
  retention:
    max_age_days: 90
    compress: true
```

### Custom Log Types

Log types are defined in `templates/logs/` (built-in) or a custom path. Each type has a `type.yaml` manifest defining output path patterns, frontmatter fields, document structure, and retention rules.

```yaml
logs:
  custom_templates_path: .fractary/logs/templates/manifest.yaml
```

---

## Log CRUD Operations

### Quick Reference

| Operation | SDK | CLI | MCP | Plugin |
|-----------|-----|-----|-----|--------|
| [Write](#write-log) | [`writeLog(opts)`](#write-log-sdk) | [`logs write`](#write-log-cli) | [`logs_capture`](#write-log-mcp) | [`/logs-write`](#write-log-plugin) |
| [Read](#read-log) | [`readLog(id)`](#read-log-sdk) | [`logs read`](#read-log-cli) | [`logs_read`](#read-log-mcp) | [`/logs-read`](#read-log-plugin) |
| [List](#list-logs) | [`listLogs(opts)`](#list-logs-sdk) | [`logs list`](#list-logs-cli) | [`logs_list`](#list-logs-mcp) | [`/logs-list`](#list-logs-plugin) |
| [Search](#search-logs) | [`searchLogs(opts)`](#search-logs-sdk) | [`logs search`](#search-logs-cli) | [`logs_search`](#search-logs-mcp) | [`/logs-search`](#search-logs-plugin) |
| [Delete](#delete-log) | [`deleteLog(id)`](#delete-log-sdk) | [`logs delete`](#delete-log-cli) | - | [`/logs-delete`](#delete-log-plugin) |
| [Log Message](#log-message) | - | - | - | [`/logs-log`](#log-message-plugin) |

> CLI commands are prefixed with `fractary-core` (e.g., `fractary-core logs write`).

---

### Write Log

Write a new log entry.

#### Write Log: SDK

```typescript
const log = logManager.writeLog({
  type: 'session',
  title: 'Feature Development Session',
  content: 'Session transcript...',
  issueNumber: 123
});
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | LogType | Yes | Log type |
| `title` | string | Yes | Log title |
| `content` | string | Yes | Log content |
| `issueNumber` | number | No | Associated issue |
| `metadata` | object | No | Additional metadata |

**Returns:** `LogEntry`

#### Write Log: CLI

```bash
fractary-core logs write --type session --title "Dev Session" --content "..."
fractary-core logs write --type build --title "Build Log" --content "..." --issue 123
```

| Flag | Required | Description |
|------|----------|-------------|
| `--type <type>` | Yes | Log type |
| `--title <title>` | Yes | Log title |
| `--content <text>` | Yes | Log content |
| `--issue <number>` | No | Associated issue |
| `--json` | No | Output as JSON |

#### Write Log: MCP

Tool: `fractary_logs_capture`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | Log type |
| `title` | string | Yes | Log title |
| `content` | string | Yes | Log content |
| `issue_number` | number | No | Associated issue |
| `metadata` | object | No | Additional metadata |

#### Write Log: Plugin

Command: `/fractary-logs-write`

| Argument | Required | Description |
|----------|----------|-------------|
| `--type <type>` | Yes | Log type |
| `--title <title>` | Yes | Log title |
| `--content <text>` | Yes | Log content |
| `--issue <number>` | No | Associated issue |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI (`fractary-core logs write`). No agent delegation.

---

### Read Log

Read a log entry by ID or path.

#### Read Log: SDK

```typescript
const log = logManager.readLog('LOG-20240101-001');
```

**Returns:** `LogEntry | null`

#### Read Log: CLI

```bash
fractary-core logs read LOG-20240101-001
```

#### Read Log: MCP

Tool: `fractary_logs_read` with `{ "log_id": "LOG-20240101-001" }`

#### Read Log: Plugin

Command: `/fractary-logs-read`

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Log ID |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI. No agent delegation.

---

### List Logs

#### List Logs: SDK

```typescript
const logs = logManager.listLogs({ type: 'session', issueNumber: 123, limit: 10 });
```

#### List Logs: CLI

```bash
fractary-core logs list
fractary-core logs list --type session --issue 123 --limit 10
```

| Flag | Description |
|------|-------------|
| `--type <type>` | Filter by log type |
| `--status <status>` | Filter by status |
| `--issue <number>` | Filter by issue |
| `--limit <n>` | Max results (default: 20) |
| `--json` | Output as JSON |

#### List Logs: MCP

Tool: `fractary_logs_list`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | No | Filter by log type |
| `status` | string | No | Filter by status |
| `issue_number` | number | No | Filter by issue |
| `since` | string | No | Start date (ISO 8601) |
| `until` | string | No | End date (ISO 8601) |
| `limit` | number | No | Max results |

#### List Logs: Plugin

Command: `/fractary-logs-list`

| Argument | Required | Description |
|----------|----------|-------------|
| `--type <type>` | No | Filter by log type |
| `--status <status>` | No | Filter by status |
| `--issue <number>` | No | Filter by issue |
| `--limit <n>` | No | Max results |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI. No agent delegation.

---

### Search Logs

#### Search Logs: SDK

```typescript
const results = logManager.searchLogs({
  query: 'authentication error',
  type: 'session',
  since: new Date('2024-01-01')
});
```

#### Search Logs: CLI

```bash
fractary-core logs search --query "error" --type session
fractary-core logs search --query "auth.*fail" --regex --issue 123
```

| Flag | Description |
|------|-------------|
| `--query <text>` | Search query (required) |
| `--type <type>` | Filter by type |
| `--issue <number>` | Filter by issue |
| `--regex` | Use regex matching |
| `--limit <n>` | Max results (default: 10) |
| `--json` | Output as JSON |

#### Search Logs: MCP

Tool: `fractary_logs_search`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query |
| `type` | string | No | Filter by log type |
| `issue_number` | number | No | Filter by issue |
| `since` | string | No | Start date (ISO 8601) |
| `until` | string | No | End date (ISO 8601) |
| `regex` | boolean | No | Use regex matching |

#### Search Logs: Plugin

Command: `/fractary-logs-search`

| Argument | Required | Description |
|----------|----------|-------------|
| `--query <text>` | Yes | Search query |
| `--type <type>` | No | Filter by type |
| `--issue <number>` | No | Filter by issue |
| `--regex` | No | Use regex matching |
| `--limit <n>` | No | Max results |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI. No agent delegation.

---

### Delete Log

#### Delete Log: SDK

```typescript
logManager.deleteLog('LOG-20240101-001');
```

#### Delete Log: CLI

```bash
fractary-core logs delete LOG-20240101-001
```

#### Delete Log: Plugin

Command: `/fractary-logs-delete`

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Log ID |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI. No agent delegation.

---

### Log Message

Log a specific message or decision to an issue's log. Useful for recording decisions, notes, or status updates.

#### Log Message: Plugin

Command: `/fractary-logs-log`

| Argument | Required | Description |
|----------|----------|-------------|
| `<issue_number>` | Yes | Issue number |
| `<message>` | Yes | Message to log |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Delegates to **`fractary-logs-log`** agent. The agent appends the message to the appropriate issue log, creating it if needed.

**Agent triggers:** "log message", "record decision", "add to log"

> This operation is plugin-only. The agent handles log file discovery and creation.

---

## Session Capture

### Quick Reference

| Operation | SDK | CLI | MCP | Plugin |
|-----------|-----|-----|-----|--------|
| [Start Capture](#start-capture) | [`startCapture(opts)`](#start-capture-sdk) | [`logs capture`](#start-capture-cli) | - | [`/logs-capture`](#start-capture-plugin) |
| [Stop Capture](#stop-capture) | [`stopCapture()`](#stop-capture-sdk) | [`logs stop`](#stop-capture-cli) | - | [`/logs-stop`](#stop-capture-plugin) |

---

### Start Capture

Start recording a session associated with an issue.

#### Start Capture: SDK

```typescript
const capture = logManager.startCapture({
  issueNumber: 123,
  redactSensitive: true,
  model: 'claude-sonnet-4-6'
});
console.log('Session ID:', capture.sessionId);
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issueNumber` | number | No | Associated issue |
| `title` | string | No | Session title |
| `redactSensitive` | boolean | No | Redact sensitive data |
| `model` | string | No | AI model being used |

#### Start Capture: CLI

```bash
fractary-core logs capture 123
fractary-core logs capture 123 --model claude-3
```

#### Start Capture: Plugin

Command: `/fractary-logs-capture`

| Argument | Required | Description |
|----------|----------|-------------|
| `<issue_number>` | Yes | Issue number |
| `--model <model>` | No | Model being used |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI. No agent delegation.

---

### Stop Capture

Stop the active session capture and save the log.

#### Stop Capture: SDK

```typescript
const result = logManager.stopCapture();
if (result) {
  console.log('Saved:', result.path, 'Duration:', result.duration);
}
```

**Returns:** `CaptureResult | null`

#### Stop Capture: CLI

```bash
fractary-core logs stop
```

#### Stop Capture: Plugin

Command: `/fractary-logs-stop`

**Delegation:** Executes directly via CLI. No agent delegation.

---

## Maintenance Operations

### Quick Reference

| Operation | SDK | CLI | MCP | Plugin |
|-----------|-----|-----|-----|--------|
| [Archive](#archive-logs) | [`archiveLogs(opts)`](#archive-logs-sdk) | [`logs archive`](#archive-logs-cli) | [`logs_archive`](#archive-logs-mcp) | [`/logs-archive`](#archive-logs-plugin) |
| [Cleanup](#cleanup-logs) | [`cleanup(opts)`](#cleanup-logs-sdk) | - | - | [`/logs-cleanup`](#cleanup-logs-plugin) |
| [Validate](#validate-log) | - | [`logs validate`](#validate-log-cli) | - | [`/logs-validate`](#validate-log-plugin) |
| [Analyze](#analyze-logs) | - | - | - | [`/logs-analyze`](#analyze-logs-plugin) |
| [Audit](#audit-logs) | - | - | - | [`/logs-audit`](#audit-logs-plugin) |

---

### Archive Logs

Archive logs older than a threshold.

#### Archive Logs: SDK

```typescript
const result = logManager.archiveLogs({ maxAgeDays: 90, compress: true });
```

#### Archive Logs: CLI

```bash
fractary-core logs archive
fractary-core logs archive --max-age 30 --compress
```

| Flag | Description |
|------|-------------|
| `--max-age <days>` | Archive logs older than N days (default: 90) |
| `--compress` | Compress archived logs |
| `--json` | Output as JSON |

#### Archive Logs: MCP

Tool: `fractary_logs_archive`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `max_age_days` | number | No | Age threshold in days |
| `compress` | boolean | No | Compress archived logs |

#### Archive Logs: Plugin

Command: `/fractary-logs-archive`

| Argument | Required | Description |
|----------|----------|-------------|
| `--max-age <days>` | No | Age threshold (default: 90) |
| `--compress` | No | Compress archives |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI. No agent delegation.

---

### Cleanup Logs

Archive and clean up old logs based on age thresholds.

#### Cleanup Logs: SDK

```typescript
const preview = logManager.cleanup({ maxAgeDays: 90, dryRun: true });
console.log('Would delete:', preview.count);

const result = logManager.cleanup({ maxAgeDays: 90 });
```

#### Cleanup Logs: Plugin

Command: `/fractary-logs-cleanup`

| Argument | Required | Description |
|----------|----------|-------------|
| `--older-than <days>` | No | Age threshold |
| `--dry-run` | No | Preview without deleting |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Delegates to **`fractary-logs-cleanup`** agent. The agent handles archival and cleanup with safety checks.

**Agent triggers:** "cleanup logs", "remove old logs", "free space"

---

### Validate Log

Validate a log file against its type schema.

#### Validate Log: CLI

```bash
fractary-core logs validate .fractary/logs/session/2024-01-15-auth-work.md
fractary-core logs validate my-log.md --log-type session
```

| Flag | Description |
|------|-------------|
| `--log-type <type>` | Override auto-detected type |
| `--json` | Output as JSON |

#### Validate Log: Plugin

Command: `/fractary-logs-validate`

| Argument | Required | Description |
|----------|----------|-------------|
| `<file>` | Yes | Path to log file |
| `--log-type <type>` | No | Override auto-detected type |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI. No agent delegation.

---

### Analyze Logs

Analyze logs for patterns, errors, summaries, or time spent.

#### Analyze Logs: Plugin

Command: `/fractary-logs-analyze`

| Argument | Required | Description |
|----------|----------|-------------|
| `<type>` | Yes | Log type to analyze |
| `--issue <number>` | No | Filter by issue |
| `--since <date>` | No | Start date |
| `--until <date>` | No | End date |
| `--verbose` | No | Detailed output |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Delegates to **`fractary-logs-analyze`** agent. The agent reads logs, identifies patterns, and generates analysis reports.

**Agent triggers:** "analyze logs", "find errors", "log patterns", "time analysis"

> This operation is plugin-only. The AI analysis requires an agent.

---

### Audit Logs

Audit logs in a project and generate a management plan.

#### Audit Logs: Plugin

Command: `/fractary-logs-audit`

| Argument | Required | Description |
|----------|----------|-------------|
| `--project-root <path>` | No | Project root path |
| `--execute` | No | Execute the generated plan |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Delegates to **`fractary-logs-audit`** agent. The agent scans for unmanaged logs, identifies compliance issues, and generates remediation plans.

**Agent triggers:** "audit logs", "log health check", "find unmanaged logs"

> This operation is plugin-only. The AI audit requires an agent.

---

## Type Management

### Quick Reference

| Operation | CLI | Plugin |
|-----------|-----|--------|
| [List Types](#list-log-types) | [`logs types`](#list-log-types-cli) | [`/logs-types`](#list-log-types-plugin) |
| [Type Info](#get-type-info) | [`logs type-info`](#get-type-info-cli) | [`/logs-type-info`](#get-type-info-plugin) |

---

### List Log Types

#### List Log Types: CLI

```bash
fractary-core logs types
```

#### List Log Types: Plugin

Command: `/fractary-logs-types`

**Delegation:** Executes directly via CLI. No agent delegation.

---

### Get Type Info

Get detailed information about a specific log type including output paths, frontmatter fields, and retention rules.

#### Get Type Info: CLI

```bash
fractary-core logs type-info session
```

#### Get Type Info: Plugin

Command: `/fractary-logs-type-info`

| Argument | Required | Description |
|----------|----------|-------------|
| `<type>` | Yes | Log type ID |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI. No agent delegation.

---

## Agents

### fractary-logs-analyze

Analyzes logs for patterns, errors, summaries, or time analysis. Reads log files and generates structured analysis reports.

**Invoked by:** `/fractary-logs-analyze` command

**Triggers proactively:** "analyze logs", "find errors", "log patterns", "time analysis"

### fractary-logs-audit

Audits existing logs, identifies what should be managed, and generates remediation plans for log compliance.

**Invoked by:** `/fractary-logs-audit` command

**Triggers proactively:** "audit logs", "log health check", "find unmanaged logs", "log compliance"

### fractary-logs-cleanup

Archives and cleans up old logs based on age thresholds with safety checks and dry-run support.

**Invoked by:** `/fractary-logs-cleanup` command

**Triggers proactively:** "cleanup logs", "remove old logs", "free space"

### fractary-logs-log

Logs specific messages or decisions to an issue's log file, creating the log if it doesn't exist.

**Invoked by:** `/fractary-logs-log` command

**Triggers proactively:** "log message", "record decision", "add to log"

---

## Types & Schemas

```typescript
type LogType = 'session' | 'build' | 'deployment' | 'test' | 'debug' | 'audit' | 'operational' | 'workflow';

type LogStatus = 'active' | 'completed' | 'stopped' | 'success' | 'failure' | 'error';

interface LogEntry {
  id: string;
  type: LogType;
  path: string;
  title: string;
  content: string;
  metadata: LogMetadata;
  issueNumber?: number;
  status: LogStatus;
  createdAt: string;
  updatedAt: string;
}

interface LogMetadata {
  model?: string;
  duration?: number;
  messageCount?: number;
  toolCalls?: number;
  tags?: string[];
}

interface CaptureResult {
  sessionId: string;
  path: string;
  status: 'started' | 'completed' | 'error';
  startedAt: string;
  completedAt?: string;
  duration?: number;
}

interface LogSearchResult {
  logId: string;
  title: string;
  path: string;
  type: LogType;
  matches: Array<{ line: number; content: string; context: string }>;
  score: number;
}
```

---

## Error Handling

### SDK Errors

```typescript
import { LogError } from '@fractary/core';

try {
  logManager.startCapture({ issueNumber: 123 });
} catch (error) {
  if (error instanceof LogError) {
    console.error('Log error:', error.message);
  }
}
```

Error types: `NoActiveSessionError`, `SessionActiveError`, `LogNotFoundError`

### Sensitive Data Redaction

When `redactSensitive` is enabled, the following are automatically redacted: API tokens, passwords, email addresses, IP addresses, and paths containing sensitive directories.

### CLI Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | General error |
| `3` | Resource not found / validation failure |

### MCP Error Codes

| Code | Description |
|------|-------------|
| `NOT_FOUND` | Log entry not found |
| `VALIDATION_ERROR` | Invalid parameters |
