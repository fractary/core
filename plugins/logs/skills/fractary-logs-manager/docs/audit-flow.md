# Log Audit Flow

## Critical Rules
1. ALWAYS generate both audit report and remediation spec
2. ALWAYS identify logs in version control
3. ALWAYS calculate potential storage savings
4. With --execute, execute high-priority remediations automatically

## Workflow

### Step 1: Get available types
```bash
fractary-core logs types --json
```

### Step 2: Load configuration and .gitignore patterns

### Step 3: Discover all log files and log-like files in project

### Step 4: Validate each discovered log file
```bash
fractary-core logs validate <file> [--log-type <type>] --json
```

### Step 5: List managed logs
```bash
fractary-core logs list --json
```

### Step 6: Compare discovered files against managed logs

### Step 7: Analyze against best practices (retention, type coverage, validation status)

### Step 8: Generate audit report (ephemeral) at `/logs/audits/audit-{timestamp}.md`

### Step 9: Generate remediation spec (persistent) at `/specs/logs-remediation-{timestamp}.md`

### Step 10: If --execute, execute high-priority fixes

### Step 11: Return summary
