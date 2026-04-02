# Documentation Consistency Check Flow

Checks if high-level docs (CLAUDE.md, README.md) are consistent with recent code changes.

## Critical Rules
1. Compare against git diff between base and head refs
2. Identify which documentation sections may need updates
3. With --fix, generate update suggestions with user confirmation
4. NEVER auto-apply changes without confirmation unless mode=auto

## Workflow

### Step 1: Analyze git diff between base and head refs
Identify code changes: API changes, new features, architecture changes, config changes.

### Step 2: Check target documents for affected sections
For each target doc, determine which sections reference changed code.

### Step 3: Report stale/current status for each document
Show which sections are potentially outdated and why.

### Step 4: Generate updates (if --fix)
For each stale section, generate suggested updates.
Apply based on mode:
- **confirm**: Show diff and ask for approval
- **auto**: Apply directly
- **dry-run**: Show what would change without applying

### Step 5: Return consistency report
- Changes detected (features, architecture, config)
- Document status (current, stale, not found)
- Affected sections per document
- Suggested updates (if --fix)
