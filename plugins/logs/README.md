# fractary-logs Plugin

> ✅ **STABLE RELEASE** - See [STATUS.md](STATUS.md) for details
>
> **What Works**: Session capture, cloud backup, AI summaries, search, analysis
> **New Features**: Automatic cloud backup after 7 days, AI-powered session summaries
> **Recommended**: Production-ready for log retention and knowledge management

Operational log management for Claude Code development sessions, including session capture, automatic cloud backup, AI-powered summaries, search, and analysis.

## Overview

The fractary-logs plugin provides comprehensive logging infrastructure for development workflows:

- **Session Capture**: Record Claude Code conversations in structured markdown ✅
- **Automatic Cloud Backup**: Auto-archive logs older than 7 days to prevent data loss ✅
- **AI-Powered Summaries**: Generate intelligent summaries with key decisions, learnings, and insights ✅
- **Hybrid Retention**: 7-day local storage, forever in cloud (S3, R2, GCS, etc.) ✅
- **Separate Storage Paths**: Logs in `/claude-logs/`, summaries in `/claude-summaries/` ✅
- **Search**: Fast local + cloud search with filters ✅
- **Analysis**: Error extraction, pattern detection, session summaries, time analysis ✅

## Architecture

```
fractary-logs
├── log-manager (agent)          # Orchestrates all log operations
├── log-capturer (skill)         # Capture sessions
├── log-archiver (skill)         # Archive with hybrid retention
├── log-summarizer (skill)       # Generate AI-powered summaries (NEW)
├── log-searcher (skill)         # Search local + cloud
└── log-analyzer (skill)         # Extract insights
```

## Key Features

### 🔄 Automatic Cloud Backup

**Never lose your Claude sessions again!** The plugin automatically backs up logs older than 7 days to your configured cloud storage (S3, R2, GCS, etc.).

**How it works:**
- **On initialization**: Checks for logs older than 7 days and backs them up
- **On session start**: Background check for old logs, auto-backup without blocking
- **Configurable threshold**: Adjust `auto_backup.backup_older_than_days` (default: 7)

**Why 7 days?**
Claude API logs are retained for only 7 days. This plugin ensures you have a permanent backup before Claude deletes them.

**Storage structure:**
```
archive/logs/
├── claude-logs/
│   └── 2025/
│       ├── session-123-2025-01-15.md.gz
│       └── session-124-2025-01-16.md.gz
└── claude-summaries/
    └── 2025/
        ├── session-123-2025-01-15-summary.md
        └── session-124-2025-01-16-summary.md
```

### 🤖 AI-Powered Session Summaries

**Quickly understand past sessions** without reading the full conversation. The plugin uses Claude to analyze sessions and generate intelligent summaries.

**What's included:**
- **Key Accomplishments**: What was actually completed
- **Technical Decisions**: What was decided and why
- **Learnings & Insights**: Gotchas, best practices, new techniques
- **Files Changed**: Categorized by type of change
- **Issues Encountered**: Problems and solutions
- **Follow-up Items**: TODOs and unresolved questions

**Example summary excerpt:**
```markdown
## Key Accomplishments
- Implemented OAuth2 authentication flow with JWT tokens
- Added user session management with Redis
- Created comprehensive test suite (95% coverage)

## Technical Decisions
### Session Storage
**Decision**: Use Redis for session storage
**Rationale**: Fast in-memory access, built-in TTL, horizontal scaling
**Alternatives Considered**: PostgreSQL (too slow), JWT-only (stateless but less secure)

## Learnings & Insights
- **Redis Connection Pooling**: Always configure maxClients for production
- **JWT Refresh Tokens**: Store in httpOnly cookies to prevent XSS
- **OAuth State Parameter**: Critical for CSRF protection, don't skip!
```

**⚠️ Cost Considerations**:
AI summaries use Claude API calls and incur costs. **Disabled by default.**

- **Estimated cost per session**: $0.01-0.05 (varies by session length)
- **Typical monthly cost** (10 sessions/day): $3-15/month
- **Enable only if**: You frequently review past sessions and need quick summaries
- **Alternative**: Use built-in analysis commands (free) for quick insights

To enable AI summaries:
```json
{
  "summarization": {
    "enabled": true,
    "auto_generate_on_archive": true
  },
  "auto_backup": {
    "generate_summaries": true
  }
}
```

### 📂 Separate Storage Paths

Logs and summaries are stored in separate, configurable paths:
- **Logs**: `archive/logs/claude-logs/{year}/` (compressed)
- **Summaries**: `archive/logs/claude-summaries/{year}/` (markdown)

**Benefits:**
- Easier to browse summaries without downloading full logs
- Different retention policies possible
- Cleaner organization
- Faster summary access

## Quick Start

### 1. Initialize

```bash
/fractary-logs:init
```

Creates configuration and log directories.

### 2. Capture Session

```bash
/fractary-logs:capture 123
```

Starts recording conversation for issue #123.

### 3. Search Logs

```bash
/fractary-logs:search "OAuth implementation"
```

Search across all logs (local and archived).

### 4. Archive Logs

```bash
/fractary-logs:archive 123
```

Archive logs for completed issue to cloud.

## Commands

### Session Management

- `/fractary-logs:capture <issue>` - Start capturing session
- `/fractary-logs:stop` - Stop active capture
- `/fractary-logs:log <issue> "<message>"` - Log specific message

### Archival

- `/fractary-logs:archive <issue>` - Archive logs for issue
- `/fractary-logs:cleanup [--older-than 30]` - Time-based cleanup

### Search & Analysis

- `/fractary-logs:search "<query>" [options]` - Search logs
- `/fractary-logs:analyze <type> [options]` - Analyze logs
  - `errors` - Extract all errors
  - `patterns` - Find recurring issues
  - `session` - Summarize session
  - `time` - Analyze time spent
- `/fractary-logs:read <issue>` - Read logs for issue

### Configuration

- `/fractary-logs:init` - Initialize configuration

## Global Arguments

All commands support the `--context` argument for passing additional instructions:

```bash
--context "<text>"
```

This argument is always optional and appears as the final argument. When provided, agents prepend the context as additional instructions to their workflow.

**Examples:**

```bash
# Guide log capture focus
/fractary-logs:capture 123 --context "Focus on API integration decisions"

# Customize search behavior
/fractary-logs:search "error" --context "Include full stack traces in results"

# Focus analysis on specific areas
/fractary-logs:analyze errors --context "Prioritize authentication-related errors"
```

See [Context Argument Standard](../../docs/plugin-development/context-argument-standard.md) for full documentation.

## Features

### Session Capture

Record Claude Code conversations:
- Structured markdown format
- Automatic timestamps
- Issue linking
- Sensitive data redaction
- Key decisions highlighted
- Files touched tracked

Example session log:
```markdown
---
session_id: session-123-2025-01-15-0900
issue_number: 123
started: 2025-01-15T09:00:00Z
ended: 2025-01-15T11:30:00Z
duration_minutes: 150
---

# Session Log: User Authentication

## Conversation

### [09:15] User
Can we implement OAuth2?

### [09:16] Claude
Yes, let me break down the requirements...
```

### Hybrid Retention

**Local Storage (Fast)**:
- Recent/active logs (30 days default)
- Immediate access
- No cloud calls
- Lower cost

**Cloud Storage (Forever)**:
- Long-term archival
- Compressed (60-70% reduction)
- Searchable via index
- Permanent record

**Automatic Transition**:
- Lifecycle-based: Archive when issue closes
- Time-based: Archive logs older than 30 days
- Safety net: Never lose logs

## Archiving

### Why Archive Logs?

Archived logs are **out of sight, out of mind** for Claude. Without archiving:
- Old logs clutter the workspace
- Claude may find and reference outdated session information
- Local storage fills up over time

Archiving ensures Claude stays focused on current work while preserving history.

### Archive Modes

The archive command supports two modes:

| Mode | Description | When Used |
|------|-------------|-----------|
| **Cloud Storage** (Preferred) | Uploads to S3/R2/GCS | When `fractary-file` is configured |
| **Local Archive** (Fallback) | Moves to `.fractary/logs/archive/` | When cloud storage not configured |

**Automatic Mode Detection**: The archive command automatically detects which mode to use.

**Force Local Archive**: Use `--local` flag:
```bash
/fractary-logs:archive 123 --local
```

### Local Archive (Default Fallback)

When cloud storage is not configured, logs are archived locally:

```
.fractary/logs/archive/
├── sessions/
│   ├── 2026-01-15-issue-123.md
│   └── 2026-01-16-issue-124.md
├── builds/
│   └── 123-build.log
└── ...
```

The archive mirrors the local structure - logs are moved to the archive root while preserving their subdirectory structure and filenames. Each log type determines its own naming convention during creation (e.g., sessions may include dates).

**Key Points**:
- The archive directory is **gitignored** (won't be committed)
- The archive directory is **hidden from Claude** (via `.claude/settings.json` deny rules)
- Logs are preserved locally but won't pollute Claude's context

### Cloud Archive (Preferred)

When `fractary-file` plugin is configured with cloud storage:

```
Cloud: archive/logs/{relative_path_from_local}
Local: Log files are removed after successful upload
```

The cloud archive path mirrors the local structure - only the root differs.

**Benefits over local archive**:
- Logs completely removed from local machine
- Compressed storage (60-70% smaller)
- Accessible from any machine
- Permanent, searchable record

### Configuring Cloud Storage

To enable cloud archiving, configure the `file` section in `.fractary/config.yaml`:

```yaml
file:
  schema_version: "2.0"
  sources:
    logs:
      type: s3           # Options: s3, r2, gcs, gdrive, local
      bucket: my-project-files
      prefix: logs/
      region: us-east-1
      local:
        base_path: .fractary/logs
      push:
        compress: true     # Compress logs (recommended)
        keep_local: false  # Remove local after upload
      auth:
        profile: default   # AWS profile or use env vars
```

**For Cloudflare R2:**
```yaml
file:
  sources:
    logs:
      type: r2
      bucket: my-project-files
      prefix: logs/
      account_id: ${CLOUDFLARE_ACCOUNT_ID}
      auth:
        access_key_id: ${R2_ACCESS_KEY_ID}
        secret_access_key: ${R2_SECRET_ACCESS_KEY}
```

After configuring, the archive command will automatically use cloud storage.

### How Claude is Protected from Archived Logs

Both archive modes ensure Claude cannot accidentally find archived logs:

1. **Gitignore**: `.fractary/logs/archive/` is gitignored
2. **Claude Settings**: `.claude/settings.json` contains deny rules:
   ```json
   {
     "permissions": {
       "deny": [
         "Read(./.fractary/logs/archive/**)"
       ]
     }
   }
   ```

This prevents Claude's search tools (Glob/Grep/Read) from accessing archived content.

### Search

**Hybrid Search**:
```bash
/fractary-logs:search "OAuth" --issue 123
```

Searches both local and cloud, aggregates results.

**Filters**:
- `--issue <number>` - Specific issue
- `--type <type>` - Log type (session|build|deployment|debug)
- `--since <date>` - Start date
- `--until <date>` - End date
- `--regex` - Regular expression
- `--local-only` - Local only (fast)
- `--cloud-only` - Cloud only (comprehensive)

### Analysis

**Error Extraction**:
```bash
/fractary-logs:analyze errors --issue 123
```

Find all errors with context, file locations, solutions.

**Pattern Detection**:
```bash
/fractary-logs:analyze patterns --since 2025-01-01
```

Identify recurring issues across multiple logs.

**Session Summary**:
```bash
/fractary-logs:analyze session 123
```

Generate concise summary: duration, decisions, files, issues.

**Time Analysis**:
```bash
/fractary-logs:analyze time --since 2025-01-01
```

Understand time spent by issue, type, day of week.

## Configuration

### Location

**v2.0+:** Configuration is in the unified **`.fractary/config.yaml`** file under the `logs` section.

### Setup

Initialize the unified configuration:
```bash
fractary-core:init
```

This creates `.fractary/config.yaml` with all plugin configurations including:
```yaml
logs:
  schema_version: "2.0"
  storage:
    local_path: .fractary/logs
    local_archive_path: .fractary/logs/archive
    cloud_archive_path: archive/logs
    # Archive paths are root directories only. Each log type
    # determines its own naming and structure during creation.
    archive_index_file: archive-index.json
  retention:
    # ... retention policies
  session_logging:
    # ... session logging settings
```

For configuration details, see the [Configuration Guide](../../docs/guides/configuration.md).

### Key Settings

**Storage**:
```json
{
  "storage": {
    "local_path": ".fractary/logs",
    "local_archive_path": ".fractary/logs/archive",
    "cloud_archive_path": "archive/logs",
    "provider": "s3",
    "bucket": "fractary-logs"
  }
}
```

**Retention & Auto-Backup**:
```json
{
  "retention": {
    "strategy": "hybrid",
    "local_days": 30,
    "cloud_days": "forever",
    "auto_archive_on_age": true,
    "auto_archive_threshold_days": 7
  },
  "auto_backup": {
    "enabled": true,
    "trigger_on_init": true,
    "trigger_on_session_start": true,
    "backup_older_than_days": 7,
    "generate_summaries": false  // Disabled by default (API costs)
  }
}
```

**AI Summaries** (disabled by default due to API costs):
```json
{
  "summarization": {
    "enabled": false,  // Set to true to enable (incurs API costs)
    "auto_generate_on_archive": false,
    "model": "claude-sonnet-4-5-20250929",
    "store_with_logs": false,
    "separate_paths": true,
    "format": "markdown"
  }
}
```

**Storage Paths**:
```json
{
  "storage": {
    "cloud_logs_path": "archive/logs/claude-logs",
    "cloud_summaries_path": "archive/logs/claude-summaries"
  }
}
```

**Session Logging**:
```json
{
  "session_logging": {
    "enabled": true,
    "format": "markdown",
    "redact_sensitive": true,
    "auto_name_by_issue": true
  }
}
```

## Integration

### fractary-file

**Required dependency** for cloud storage operations.

The logs plugin integrates via **agent-to-agent invocation**:
- log-manager agent invokes file-manager agent from fractary-file
- file-manager handles all cloud operations (upload, read, delete)
- Supports multiple providers: R2, S3, GCS, Google Drive, Local

**Setup**:
1. Initialize fractary-file: `/fractary-file:init`
2. Configure storage provider (R2, S3, etc.)
3. Test connection: `/fractary-file:test-connection`

**How it works**:
- When archiving logs, log-manager prepares metadata
- log-manager invokes file-manager to upload each file
- file-manager returns cloud URLs
- log-manager updates archive index with URLs
- Archived logs remain searchable via index

**Without fractary-file**:
- Archival operations will fail
- Use local-only mode (no cloud archival)
- Set `retention.strategy` to `"local"` in config

### fractary-work

Optional GitHub integration:
- Comment on issues when logs captured
- Comment on issues when logs archived
- Link sessions to work items

### FABER Workflows

Auto-capture during FABER:
- Starts when workflow begins
- Continues through all phases
- Archives when work completes

## Directory Structure

```
/logs/
├── .archive-index.json       # Archive metadata (searchable)
├── sessions/                 # Session logs
│   ├── session-123-2025-01-15.md
│   └── session-124-2025-01-16.md
├── builds/                   # Build logs
│   └── 123-build.log
├── deployments/              # Deployment logs
│   └── 123-deploy.log
└── debug/                    # Debug logs
    └── 123-debug.log
```

## Best Practices

### Session Capture

**Do capture**:
- Feature implementations
- Bug investigations
- Architecture discussions
- Complex refactorings

**Don't capture**:
- Trivial changes
- Simple file edits
- Quick questions

### Archival

**Lifecycle-based** (Automatic):
- Let plugin archive when issues close
- Reliable and timely
- No manual intervention

**Time-based** (Safety net):
- Run daily: `0 2 * * * /fractary-logs:cleanup`
- Catches abandoned work
- Prevents storage bloat

### Search

**Fast searches**:
- Use `--local-only` for recent work
- Specify `--issue` when known
- Use `--type` to narrow scope

**Comprehensive searches**:
- Use hybrid search (default)
- Use `--cloud-only` for historical
- Remove filters for broad search

### Analysis

**Regular analysis**:
- Weekly: Error extraction for current work
- Monthly: Pattern detection across all work
- Quarterly: Time analysis for planning

**Share insights**:
- Team retrospectives
- Documentation updates
- Knowledge base
- Best practices

## Advanced Usage

### Custom Analysis

Combine search and read for custom analysis:
```bash
/fractary-logs:search "interesting pattern" --since 2024-01-01
/fractary-logs:read <issue>
# Manual analysis or pipe to custom scripts
```

### Archive Index

Direct access to archive index:
```bash
cat /logs/.archive-index.json | jq '.archives[] | select(.issue_number == "123")'
```

### Bulk Operations

Archive multiple issues:
```bash
for issue in 123 124 125; do
  /fractary-logs:archive $issue
done
```

## Troubleshooting

### "No active session"

You tried to stop or append without starting capture.

**Solution**: `/fractary-logs:capture <issue>` first

### "Archive index not found"

Index file missing or corrupted.

**Solution**: `/fractary-logs:init` to reinitialize

### "Upload failed"

fractary-file integration issue.

**Solution**:
- Check fractary-file configuration
- Verify cloud credentials
- Logs remain local until resolved

### Search not finding archived logs

Archive index out of sync.

**Solution**: Rebuild index or re-archive with `--force`

## Development

### Adding New Log Types

1. Create directory: `/logs/<new-type>/`
2. Update collection scripts to include new type
3. Update search to recognize new type
4. Add to configuration schema

### Custom Scripts

All scripts in `skills/*/scripts/` can be extended or replaced:
- Bash scripts for deterministic operations
- Follow existing patterns
- Update skill documentation

## Documentation

- [Session Logging Guide](skills/log-capturer/docs/session-logging-guide.md)
- [Archive Process](skills/log-archiver/docs/archive-process.md)
- [Search Syntax](skills/log-searcher/docs/search-syntax.md)
- [Analysis Types](skills/log-analyzer/docs/analysis-types.md)

## License

Part of the Fractary Claude Code Plugins ecosystem.
