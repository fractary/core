# Logs Toolset - CLI Reference

Command-line reference for the Logs toolset. Session and operational logging.

## Command Structure

```bash
fractary-core logs <action> [options]
```

## Log Commands

### logs write

Write a new log entry.

```bash
fractary-core logs write [options]
```

**Options:**
- `--type <type>` - Log type: `session`, `build`, `deployment`, `test`, `debug`, `audit`, `operational`, `workflow`
- `--title <text>` - Log title (required)
- `--content <text>` - Log content (or use stdin)
- `--file <path>` - Read content from file
- `--issue <number>` - Associated issue number

**Examples:**
```bash
# Write session log
fractary-core logs write \
  --type session \
  --title "Development Session" \
  --content "Session notes..."

# Write from file
fractary-core logs write \
  --type build \
  --title "Build Log" \
  --file build-output.txt

# Pipe content
cat transcript.txt | fractary-core logs write \
  --type session \
  --title "Session Transcript"
```

### logs read

Read a log entry.

```bash
fractary-core logs read <log-id> [options]
```

**Arguments:**
- `log-id` - Log ID or path

**Options:**
- `--format <type>` - Output format: `json`, `text`, `raw`

**Example:**
```bash
fractary-core logs read LOG-20240101-001 --format text
```

### logs list

List log entries.

```bash
fractary-core logs list [options]
```

**Options:**
- `--type <type>` - Filter by log type
- `--issue <number>` - Filter by issue
- `--since <date>` - Logs since date (YYYY-MM-DD)
- `--until <date>` - Logs until date
- `--limit <n>` - Maximum results
- `--format <type>` - Output format

**Examples:**
```bash
# List recent session logs
fractary-core logs list --type session --limit 10

# List logs for issue #123
fractary-core logs list --issue 123

# List logs from last week
fractary-core logs list --since 2024-01-08
```

### logs search

Search across logs.

```bash
fractary-core logs search <query> [options]
```

**Arguments:**
- `query` - Search query

**Options:**
- `--type <type>` - Filter by log type
- `--issue <number>` - Filter by issue
- `--since <date>` - Start date
- `--until <date>` - End date
- `--format <type>` - Output format

**Examples:**
```bash
# Search for errors
fractary-core logs search "error" --type session

# Search in specific issue
fractary-core logs search "authentication" --issue 123
```

**Output:**
```
Search Results for "error"
==========================

LOG-20240101-001 (session)
  Line 45: "Encountered authentication error during login"
  Line 78: "Fixed error by updating token handling"

LOG-20240102-003 (build)
  Line 12: "Build error: missing dependency"
```

## Capture Commands

### logs capture start

Start session capture.

```bash
fractary-core logs capture start [options]
```

**Options:**
- `--issue <number>` - Associated issue
- `--title <text>` - Session title
- `--redact` - Redact sensitive data
- `--model <name>` - AI model being used

**Example:**
```bash
fractary-core logs capture start \
  --issue 123 \
  --title "Feature Implementation" \
  --redact
```

**Output:**
```
Session capture started
Session ID: SESSION-20240115-001
Issue: #123
Redaction: enabled

Use 'fractary-core logs capture stop' to end capture.
```

### logs capture stop

Stop active session capture.

```bash
fractary-core logs capture stop [options]
```

**Options:**
- `--summary <text>` - Add summary to log

**Example:**
```bash
fractary-core logs capture stop --summary "Completed auth implementation"
```

**Output:**
```
Session capture stopped
Session ID: SESSION-20240115-001
Duration: 2h 34m
Saved to: .fractary/logs/session/SESSION-20240115-001.md
```

### logs capture status

Check capture status.

```bash
fractary-core logs capture status
```

**Output:**
```
Active Capture
==============
Session ID: SESSION-20240115-001
Issue: #123
Started: 2024-01-15 10:30:00
Duration: 1h 15m
Messages: 45
```

## Analyze Commands

### logs analyze

Analyze logs for patterns.

```bash
fractary-core logs analyze [options]
```

**Options:**
- `--type <type>` - Log type to analyze
- `--issue <number>` - Analyze logs for issue
- `--since <date>` - Start date
- `--report <type>` - Report type: `summary`, `errors`, `time`, `full`

**Examples:**
```bash
# Get error summary
fractary-core logs analyze --type session --report errors

# Analyze time spent on issue
fractary-core logs analyze --issue 123 --report time
```

**Time Report Output:**
```
Time Analysis for Issue #123
============================

Total Sessions: 5
Total Duration: 8h 45m

By Phase:
  frame:     45m
  architect: 1h 30m
  build:     5h 15m
  evaluate:  1h 15m

By Date:
  2024-01-10: 2h 30m
  2024-01-11: 3h 45m
  2024-01-12: 2h 30m
```

## Archive Commands

### logs archive

Archive logs.

```bash
fractary-core logs archive [options]
```

**Options:**
- `--issue <number>` - Archive logs for issue
- `--older-than <days>` - Archive logs older than days
- `--type <type>` - Archive specific type
- `--destination <path>` - Archive destination

**Examples:**
```bash
# Archive logs for completed issue
fractary-core logs archive --issue 123

# Archive old logs
fractary-core logs archive --older-than 90
```

## Cleanup Commands

### logs cleanup

Clean up old logs.

```bash
fractary-core logs cleanup [options]
```

**Options:**
- `--older-than <days>` - Delete logs older than days
- `--type <type>` - Clean specific type
- `--dry-run` - Preview without deleting

**Examples:**
```bash
# Preview cleanup
fractary-core logs cleanup --older-than 90 --dry-run

# Execute cleanup
fractary-core logs cleanup --older-than 90
```

**Dry Run Output:**
```
Cleanup Preview (dry-run)
=========================

Would delete 15 logs:
  - 8 session logs
  - 4 build logs
  - 3 test logs

Total size: 2.3 MB

Run without --dry-run to execute.
```

## Audit Commands

### logs audit

Audit logs in project.

```bash
fractary-core logs audit [options]
```

**Options:**
- `--report <type>` - Report type: `health`, `compliance`, `storage`

**Example:**
```bash
fractary-core logs audit --report health
```

**Output:**
```
Log Health Report
=================

Total Logs: 156
By Type:
  session:    78
  build:      45
  test:       23
  other:      10

Storage:
  Total Size: 45.2 MB
  Oldest:     2024-01-01
  Newest:     2024-01-15

Issues:
  - 3 orphaned logs (no associated issue)
  - 12 logs older than retention policy (90 days)

Recommendations:
  - Run 'fractary-core logs cleanup --older-than 90'
  - Review orphaned logs
```

## Environment Variables

```bash
# Logs directory
export FRACTARY_LOGS_DIRECTORY=./logs

# Redaction
export FRACTARY_REDACT_SENSITIVE=true

# Retention
export FRACTARY_LOGS_MAX_AGE_DAYS=90
```

## Other Interfaces

- **SDK:** [Logs API](/docs/sdk/js/logs.md)
- **MCP:** [Logs Tools](/docs/mcp/server/logs.md)
- **Plugin:** [Logs Plugin](/docs/plugins/logs.md)
- **Configuration:** [Logs Config](/docs/guides/configuration.md#logs-toolset)
