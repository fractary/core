# Archive Issue Logs Workflow

<WORKFLOW>

## 1. Validate Archive Request

### Check if Already Archived
Check if logs for this issue already exist in cloud storage:
```bash
# Use cloud storage list to check for existing archives
node storage.mjs list logs "archive/logs/" | jq -r '.files[]' | grep "$ISSUE_NUMBER"
```

If found:
- Ask user if force re-archive needed
- If not force: Skip archival, return existing archive info

### Verify Issue Status
For lifecycle-based archival:
- issue_closed: Verify issue is actually closed
- pr_merged: Verify PR is merged
- manual: No verification needed

## 2. Migrate Local Archives to Cloud

**IMPORTANT**: Before archiving new logs, check for previously locally archived files.

When a project transitions from local to cloud archiving, files archived to
`.fractary/logs/archive/` need to be migrated to cloud storage.

Use the CLI command:
```bash
MIGRATION=$(fractary-core file migrate-archive \
    --local-dir ".fractary/logs/archive" \
    --cloud-prefix "archive/logs" \
    --source logs \
    --json)
MIGRATED_COUNT=$(echo "$MIGRATION" | jq -r '.data.migrated // 0')
FAILED_COUNT=$(echo "$MIGRATION" | jq -r '.data.failed // 0')
```

- Script scans `.fractary/logs/archive/` for any files
- Each file is uploaded to cloud at `archive/logs/{relative_path}`
- After successful upload and verification, the local copy is removed
- If no locally archived files exist, returns immediately with `migrated: 0`

If migration failures occur:
- Log the failures but continue with normal archive
- Failed files remain locally and can be retried later

## 3. Collect All Logs for Issue

Execute `scripts/collect-logs.sh <issue_number>`

Searches in:
- `/logs/sessions/` for `*{issue}*` or `session-{issue}-*`
- `/logs/builds/` for `{issue}-*`
- `/logs/deployments/` for `{issue}-*`
- `/logs/debug/` for `{issue}-*`

Returns JSON array:
```json
[
  "/logs/sessions/session-123-2025-01-15.md",
  "/logs/sessions/session-123-2025-01-16.md",
  "/logs/builds/123-build.log"
]
```

If no logs found:
- Report "No logs found for issue"
- Exit successfully

## 4. Compress Large Logs

For each log file:
1. Check size: `du -m "$LOG_FILE"`
2. If size > threshold (default 1 MB):
   - Execute `scripts/compress-logs.sh "$LOG_FILE"`
   - Returns compressed file path
3. If size <= threshold:
   - Use original file

Result: Array of files ready for upload (mix of .gz and originals)

## 5. Prepare Files for Cloud Upload

For each log file, prepare metadata for upload:

1. Generate cloud path:
   ```
   archive/logs/{year}/{month}/{issue}/filename.ext
   ```
2. Calculate checksum (SHA-256):
   ```bash
   sha256sum "$LOG_FILE" | cut -d' ' -f1
   ```
3. Prepare upload metadata:
   ```json
   {
     "local_path": "/logs/sessions/session-123-2025-01-15.md.gz",
     "remote_path": "archive/logs/2025/01/123/session-123-2025-01-15.md.gz",
     "type": "session",
     "filename": "session-123-2025-01-15.md",
     "size_bytes": 45600,
     "compressed": true,
     "checksum": "sha256:abc123...",
     "created": "2025-01-15T09:00:00Z"
   }
   ```

**Return to agent**: Array of files with upload metadata

## 6. Agent Uploads to Cloud (via file-manager)

**IMPORTANT**: This step is performed by the log-manager AGENT, not the skill.

The log-archiver skill returns control to the log-manager agent with the list of files to upload.

The log-manager agent then:

1. For each file in the upload list:
   - Invoke @agent-fractary-file:file-manager with upload operation:
     ```json
     {
       "operation": "upload",
       "parameters": {
         "local_path": "/logs/sessions/session-123-2025-01-15.md.gz",
         "remote_path": "archive/logs/2025/01/123/session-123-2025-01-15.md.gz",
         "public": false
       }
     }
     ```
   - Wait for upload completion
   - Receive cloud URL from response
   - Add cloud URL to metadata

2. Verify all uploads succeeded

3. Build complete archive metadata with URLs:
   ```json
   {
     "type": "session",
     "filename": "session-123-2025-01-15.md",
     "local_path": "/logs/sessions/session-123-2025-01-15.md",
     "cloud_url": "r2://fractary-logs/archive/logs/2025/01/123/...",
     "public_url": "https://storage.example.com/...",
     "size_bytes": 45600,
     "compressed": true,
     "checksum": "sha256:abc123...",
     "created": "2025-01-15T09:00:00Z",
     "archived": "2025-01-15T14:00:00Z"
   }
   ```

If upload fails for any file:
- STOP archival process
- Do not delete local files
- Return error to user
- Keep already-uploaded files (no rollback)

## 7. Comment on GitHub Issue

If gh CLI available and configured:

Generate comment:
```markdown
**Logs Archived**

Session logs and operational logs have been archived to cloud storage.

**Sessions**:
- [Session 2025-01-15](https://storage.example.com/.../session-2025-01-15.md.gz) (45.6 KB, 2h 30m)
- [Session 2025-01-16](https://storage.example.com/.../session-2025-01-16.md) (32.1 KB, 1h 15m)

**Build Logs**:
- [Build Log](https://storage.example.com/.../build.log.gz) (45.0 KB)

**Total**: 3 logs, 122.7 KB compressed

Archived: 2025-01-15 14:00 UTC

These logs are permanently stored and searchable via:
- `/fractary-logs:read 123`
- `/fractary-logs:search "<query>"`
```

Post comment:
```bash
gh issue comment $ISSUE_NUMBER --body "$COMMENT"
```

## 8. Clean Local Storage

For each archived log:
1. Verify cloud upload was successful
2. Delete local file:
   ```bash
   rm "$LOG_FILE"
   ```
3. Track freed space

## 9. Git Commit

Commit any local changes:
```bash
git commit -m "Archive logs for issue #$ISSUE_NUMBER

- Archived $LOG_COUNT logs to cloud storage
- Freed $FREED_SPACE locally

Archive reason: $TRIGGER
Issue: #$ISSUE_NUMBER"
```

## 10. Return Summary

Output:
```
Logs archived for issue #123
  Migrated: 2 previously local archives to cloud
  Collected: 3 logs
  Compressed: 1 log (128 KB -> 45 KB, 65% reduction)
  Uploaded: 3 logs to archive/logs/2025/01/123/
  GitHub commented: issue #123
  Local cleaned: 173 KB freed

Archive complete!
```

## Error Recovery

### Retry Strategy

**Automatic Retries** for transient failures:
- **Network errors**: Retry up to 3 times with exponential backoff (2s, 4s, 8s)
- **Rate limits**: Retry with backoff (10s, 30s, 60s)
- **Timeouts**: Retry up to 2 times with increased timeout

**No Retry** for permanent failures:
- Authentication errors (invalid credentials)
- Permission errors (access denied)
- File not found errors

**Retry Limits**:
- Maximum 3 retries per file per archive operation
- Maximum 10 minutes total retry time per file
- Exponential backoff between retries

### Partial Upload Handling

If some files uploaded, others failed:

1. **Return partial archive info to user**:
   ```
   Partial archive completed for issue #123
     Uploaded: 2 of 3 files
     Failed: 1 file

   Failed files:
     - /logs/builds/123-build.log.gz

   Retry with: /fractary-logs:archive 123 --retry
   ```

2. **Local files preserved** until all uploads succeed

### Cleanup Procedures

**On Upload Failure**:
1. Keep compressed files locally (don't delete)
2. Log error details for troubleshooting
3. Clean up temporary files (*.tmp, *.part)

**On Partial Success**:
1. Keep all local files until all uploads succeed
2. Preserve failed files for manual intervention

**Orphaned File Cleanup**:
- Compressed files (*.gz) older than 7 days with no cloud counterpart
- Temporary files (*.tmp) older than 24 hours
- Lock files (*.lock) older than 1 hour with no active process

### Cleanup Failed

If cannot delete local files after successful upload:

1. Archive succeeded (cloud is source of truth)
2. Log which files couldn't be deleted
3. Files can be manually cleaned later
4. Mark archival as successful

</WORKFLOW>

## Deprecated Features

The following features are **DEPRECATED** and should NOT be used:

- **Archive index** (`.archive-index.json`): No longer maintained. Cloud storage is the
  source of truth for archived files. Use cloud storage list/exists operations instead.
- **`update-index.sh`**: Do not call this script. It remains for backward compatibility only.
- **`sync-index.sh`**: Do not call this script. It remains for backward compatibility only.
- **Index-based duplicate detection**: Use cloud storage `exists` operation to check if a
  file has already been archived instead of querying the index.
