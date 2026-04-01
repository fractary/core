---
name: fractary-logs-logger
description: Log a specific message or decision to an issue's log — handles type selection, session detection, and entry creation
---

# Log Message

Logs messages or decisions to an issue's log file. Handles type detection, active session lookup, and appending entries.

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<issue_number>` | Yes | GitHub issue number |
| `<message>` | Yes | Message to log (use quotes for multi-word) |
| `--type <type>` | No | Log type: session, build, debug, etc. |

## Critical Rules
1. ALWAYS include timestamp with each entry
2. ALWAYS link entry to issue
3. ALWAYS append to active session or create new entry
4. NEVER overwrite existing log entries
5. If log_type is unclear, use `fractary-core logs types` to list options

## Workflow

### Step 1: Parse arguments — extract issue_number, message, type.

### Step 2: If type unclear, list available types:
```bash
fractary-core logs types --json
```
Use the fractary-logs-log-type-selector skill if more guidance needed.

### Step 3: Get type definition:
```bash
fractary-core logs type-info <type> --json
```

### Step 4: Check for active session:
```bash
fractary-core logs list --type <type> --status active --issue <number> --json
```

### Step 5: Write log entry:
```bash
fractary-core logs write --type <type> --title "<title>" --content "<content>" --issue <number> --json
```

### Step 6: Return log ID and path.
