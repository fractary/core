# Workflow: Archive Issue Specs

This workflow describes the detailed steps for archiving specifications when work completes.

## Step 1: Migrate Local Archives to Cloud

**IMPORTANT**: Before archiving new specs, check for previously locally archived files.

When a project transitions from local to cloud archiving, files archived to
`.fractary/specs/archive/` need to be migrated to cloud storage.

Execute `plugins/spec/scripts/migrate-local-archive.sh`:
```bash
MIGRATION=$(plugins/spec/scripts/migrate-local-archive.sh)
MIGRATED_COUNT=$(echo "$MIGRATION" | jq -r '.migrated // 0')
FAILED_COUNT=$(echo "$MIGRATION" | jq -r '.failed // 0')
```

- Script scans `.fractary/specs/archive/` for any files
- Each file is uploaded to cloud at `archive/specs/{relative_path}`
- After successful upload and verification, the local copy is removed
- If no locally archived files exist, returns immediately with `migrated: 0`

If migration failures occur:
- Log the failures but continue with normal archive
- Failed files remain locally and can be retried later

## Step 2: Find All Specs for Issue

Search for all specs matching the issue number:

```bash
# Format issue number with leading zeros (5 digits)
PADDED_ISSUE=$(printf "%05d" "$ISSUE_NUMBER")
find /specs -type f -name "WORK-${PADDED_ISSUE}*.md" 2>/dev/null
```

Results can include:
- Single spec: `WORK-00123-feature.md`
- Multi-spec: `WORK-00123-01-auth.md`, `WORK-00123-02-oauth.md`

If no specs found:
- Return error
- Suggest generating spec first
- Exit

Store list of spec file paths for processing.

## Step 3: Load Configuration

Load plugin configuration from `.fractary/specs/config.json`:
- Get `storage.cloud_archive_path` pattern
- Get `archive.auto_archive_on` settings
- Get `archive.pre_archive` check settings
- Get `archive.post_archive` action settings
- Get `integration` settings

## Step 4: Fetch Issue and PR Data

Use fractary-work plugin or gh CLI:

```bash
# Get issue details
gh issue view $ISSUE_NUMBER --json title,url,state,closedAt

# Get linked PR (if exists)
gh issue view $ISSUE_NUMBER --json title | grep -o "PR #[0-9]*" || echo ""
```

Extract:
- Issue title
- Issue URL
- Issue state (open/closed)
- Issue closed date
- PR number (if linked)
- PR URL (if linked)
- PR state (if exists)

## Step 5: Check Pre-Archive Conditions

Unless `--force` flag provided, check:

### Required Checks (must pass)

**1. Issue Closed OR PR Merged**:
```bash
issue_closed=$(gh issue view $ISSUE_NUMBER --json state --jq '.state == "CLOSED"')
pr_merged=$(gh pr view $PR_NUMBER --json state --jq '.state == "MERGED"' 2>/dev/null || echo "false")

if [[ "$issue_closed" != "true" ]] && [[ "$pr_merged" != "true" ]]; then
    echo "Error: Issue not closed and PR not merged"
    exit 1
fi
```

**2. Specs Exist**:
- Already verified in Step 2

### Warning Checks (prompt if `--skip-warnings` not set)

**1. Documentation Updated**:
```bash
# Get spec creation date
spec_created=$(stat -c %Y "$SPEC_PATH")

# Check for doc updates after spec creation
doc_updates=$(git log --since="@$spec_created" --name-only --format="" |
    grep "\.md$" |
    grep -v "^specs/" |
    grep -v "^spec-" |
    wc -l)

if [[ $doc_updates -eq 0 ]]; then
    WARNINGS+=("Documentation not updated since spec creation")
fi
```

**2. Validation Status**:
```bash
validated=$(awk '/^validated:/ {print $2}' "$SPEC_PATH")

if [[ "$validated" != "true" ]]; then
    WARNINGS+=("Spec validation status: $validated")
fi
```

## Step 6: Prompt User if Warnings

If warnings exist and `--skip-warnings` not set:

```
Pre-Archive Warnings

The following items may need attention:

1. Documentation hasn't been updated since spec creation
   -> Consider updating docs to reflect current state

2. Spec validation status: partial
   -> Some acceptance criteria may not be met

Do you want to:
1. Update documentation first
2. Archive anyway
3. Cancel

Enter selection [1-3]:
```

Handle user response:
- 1: Exit, let user update docs
- 2: Continue with archival
- 3: Cancel operation

## Step 7: Upload Specs to Cloud

For each spec file, upload to cloud via fractary-file plugin:

### Determine Cloud Path

Use `storage.cloud_archive_path` pattern:
```
archive/specs/{year}/{issue_number}-{phase}.md
```

Variables:
- `{year}`: Current year (e.g., "2025")
- `{issue_number}`: Issue number (e.g., "123")
- `{phase}`: Phase number if multi-spec (e.g., "phase1")

Examples:
- `archive/specs/2025/123.md` (single spec)
- `archive/specs/2025/123-phase1.md` (multi-spec phase 1)
- `archive/specs/2025/123-phase2.md` (multi-spec phase 2)

### Upload via fractary-file

```bash
# Use fractary-file plugin to upload
cloud_url=$(fractary-file upload "$SPEC_PATH" "$CLOUD_PATH")
```

Store results:
- Original filename
- Cloud URL
- File size
- Checksum (SHA256)

If upload fails:
- Abort immediately
- Don't proceed to cleanup
- Return error with details
- Specs remain in local storage

## Step 8: Comment on GitHub Issue

Build comment message:

```markdown
Work Archived

This issue has been completed and archived!

**Specifications**:
- [Phase 1: Authentication](https://storage.example.com/specs/2025/123-phase1.md) (15.4 KB)
- [Phase 2: OAuth Integration](https://storage.example.com/specs/2025/123-phase2.md) (18.9 KB)

**Archived**: 2025-01-15 14:30 UTC
**Validation**: All specs validated

These specifications are permanently stored in cloud archive for future reference.
```

Post comment:
```bash
gh issue comment $ISSUE_NUMBER --body "$COMMENT_BODY"
```

If comment fails:
- Log warning
- Continue (non-critical)

## Step 9: Comment on PR (if exists)

If PR linked to issue, comment there too:

```markdown
Specifications Archived

Specifications for this PR have been archived:
- [WORK-00123-01-auth.md](https://storage.example.com/specs/2025/123-phase1.md)
- [WORK-00123-02-oauth.md](https://storage.example.com/specs/2025/123-phase2.md)

See issue #123 for complete archive details.
```

Post comment:
```bash
gh pr comment $PR_NUMBER --body "$COMMENT_BODY"
```

If comment fails:
- Log warning
- Continue (non-critical)

## Step 10: Remove Specs from Local

Only after successful upload:

```bash
for spec in "${SPEC_FILES[@]}"; do
    rm "$spec"
done
```

Mark for git removal:
```bash
for spec in "${SPEC_FILES[@]}"; do
    git rm "$spec"
done
```

## Step 11: Git Commit

Commit spec removals:

```bash
git commit -m "Archive specs for issue #${ISSUE_NUMBER}

- Archived ${#SPEC_FILES[@]} specifications to cloud storage
- Issue: #${ISSUE_NUMBER}
- PR: #${PR_NUMBER}

Specs archived:
$(for spec in "${SPEC_FILES[@]}"; do echo "  - $(basename $spec)"; done)

Archive URLs available in issue comment."
```

If commit fails:
- Report error
- User needs to resolve conflicts
- Specs already uploaded (safe state)

## Step 12: Return Confirmation

Return structured JSON output with:
- Status (success)
- Issue number
- Archive timestamp
- Number of local archives migrated to cloud
- List of archived specs with URLs
- GitHub comment status
- Local cleanup status
- Git commit status

## Error Recovery

At each critical step:

**Migration Failure**:
- Log warning, continue with normal archive
- Failed files remain locally and can be retried

**Upload Failure**:
- Abort immediately
- Leave local specs intact
- Return error with details
- User can retry

**Cleanup Failure**:
- Specs uploaded (success)
- Local removal failed
- User can manually remove
- Still return success (archive complete)

**Git Commit Failure**:
- Specs uploaded (success)
- Local removed
- Commit failed
- User needs to commit manually
- Return partial success

## Example Execution

```
Input:
  issue_number: 123
  force: false
  skip_warnings: false

Steps:
  1. Migrated 1 previously local archive to cloud
  2. Found 2 specs for issue #123
  3. Config loaded
  4. Issue #123: closed
     PR #456: merged
  5. Pre-archive checks:
     - Issue closed: pass
     - PR merged: pass
     - Docs updated: warning
     - Validation: pass
  6. User prompted, selected "Archive anyway"
  7. Uploaded WORK-00123-01-auth.md
        -> https://storage.example.com/specs/2025/123-phase1.md
     Uploaded WORK-00123-02-oauth.md
        -> https://storage.example.com/specs/2025/123-phase2.md
  8. Issue #123 commented
  9. PR #456 commented
  10. Local specs removed
  11. Git commit created
  12. Success returned

Output:
  {
    "status": "success",
    "issue_number": "123",
    "local_archives_migrated": 1,
    "specs_archived": 2,
    "cloud_urls": [...],
    "github_comments": {"issue": true, "pr": true},
    "local_cleanup": true,
    "git_committed": true
  }
```

## Multi-Spec Considerations

When archiving multiple specs for one issue:
- Upload all specs before any removal
- Comment once with all spec URLs
- Remove all local specs together
- Commit all changes atomically

This ensures consistency: either all specs archived or none.

## Deprecated Features

The following features are **DEPRECATED** and should NOT be used:

- **Archive index** (`archive-index.json`): No longer maintained. Cloud storage is the
  source of truth for archived files. Use cloud storage list/exists operations instead.
- **`update-index.sh`**: Do not call this script. It remains for backward compatibility only.
- **`sync-index.sh`**: Do not call this script. It remains for backward compatibility only.
- Existing `archive-index.json` files can be safely deleted.
