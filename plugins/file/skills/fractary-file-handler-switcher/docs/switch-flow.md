# Handler Switch Flow

## Valid Handlers
local, r2, s3, gcs, gdrive

## Critical Rules
1. ALWAYS verify target handler is configured before switching
2. ALWAYS back up current configuration before modifying
3. ALWAYS validate configuration after switching
4. NEVER modify handler configurations, only the active_handler field
5. ALWAYS test connection after switch (unless --no-test)

## Workflow

### Step 1: Parse Arguments
Extract handler name (required), --no-test, --force flags.

### Step 2: Show Current Configuration
```bash
fractary-core file show-config --json
```
Verify the target handler exists in the configuration. If not configured and --force is not set, report error and stop.

### Step 3: Backup Current Configuration
```bash
cp .fractary/config.yaml .fractary/config.yaml.bak
```

### Step 4: Update Active Handler
Read the config file and update only the `file.active_handler` field to the target handler name. Do not modify any other fields.

### Step 5: Verify Update
```bash
fractary-core file show-config --json
```
Confirm active_handler now matches the target.

### Step 6: Test Connection (unless --no-test)
```bash
fractary-core file test-connection --json
```
If test fails, restore backup and report error.

### Step 7: Cleanup
Remove the backup file on success.

## Output
- **Success:** Show new active handler and test results
- **Failure:** Show error, restore from backup, suggest `--force` if handler appeared unconfigured
