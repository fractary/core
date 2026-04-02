# Log Cleanup Flow

## Critical Rules
1. ALWAYS archive before deleting
2. ALWAYS respect age thresholds
3. With --dry-run, only show what would be done
4. NEVER delete without archiving first

## Workflow

### Step 1: Parse --older-than (default 30 days) and --dry-run flag

### Step 2: List all logs
```bash
fractary-core logs list --json
```

### Step 3: Identify logs older than threshold by checking dates

### Step 4: Group by issue number

### Step 5: If --dry-run — report what would be archived/deleted, then stop

### Step 6: Archive old logs
```bash
fractary-core logs archive --max-age <days> --compress --json
```

### Step 7: For already-archived logs past retention, delete
```bash
fractary-core logs delete <id> --json
```

### Step 8: Handle orphaned logs (files not in managed list)

### Step 9: Return cleanup summary with counts of archived and deleted logs
