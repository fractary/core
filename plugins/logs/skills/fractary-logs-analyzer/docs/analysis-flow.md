# Log Analysis Flow

## Critical Rules
1. ALWAYS use CLI commands for log discovery and reading
2. ALWAYS respect date filters (--since, --until)
3. NEVER modify log files during analysis

## Step 1: List logs based on filters
```bash
fractary-core logs list [--type <type>] [--issue <number>] --json
```

## Step 2: Get type definitions for field understanding
```bash
fractary-core logs type-info <type> --json
```

## Step 3: Read relevant logs
```bash
fractary-core logs read <id> --json
```

## Step 4: Perform type-specific analysis

### errors
Search for error patterns:
```bash
fractary-core logs search --query "error|fail|exception" --regex --json
```
Extract error messages with context, group by frequency.

### patterns
List all logs, group by type and status, identify recurring issues and frequencies.

### session
Use session type fields: token_count, duration_seconds, status, model.
Summarize session activity, token usage, and durations.

### time
Look for duration_seconds fields across log types.
Aggregate by issue or date range, show time breakdowns.

## Common Fields by Type
- **session**: session_id, token_count, duration_seconds, status, model
- **build**: build_id, exit_code, duration_seconds, status, artifacts
- **deployment**: deployment_id, environment, version, status, duration_seconds
- **debug**: debug_id, component, severity, status
- **test**: test_id, pass_count, fail_count, coverage_percent, duration_seconds
- **workflow**: workflow_id, phase, status, operations

Run `fractary-core logs type-info <type> --json` for the complete field list.
