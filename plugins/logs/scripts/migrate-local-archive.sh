#!/usr/bin/env bash
#
# migrate-local-archive.sh - Migrate locally archived logs to cloud storage
#
# Usage: migrate-local-archive.sh [--dry-run]
#
# When a project transitions from local archiving to cloud-based archiving,
# previously archived files in .fractary/logs/archive/ need to be uploaded
# to cloud storage. This script finds all locally archived log files,
# uploads each to the cloud using the same relative path structure, and
# removes the local copy after successful upload and verification.
#
# This script is called automatically at the start of cloud archive
# operations to ensure no locally archived files are left behind.
#
# Outputs JSON with migration results.

set -euo pipefail

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=true
fi

LOCAL_ARCHIVE_DIR=".fractary/logs/archive"

# Check if local archive directory exists and has files
if [[ ! -d "$LOCAL_ARCHIVE_DIR" ]]; then
    echo '{"migrated": 0, "skipped": 0, "failed": 0, "message": "No local archive directory found"}'
    exit 0
fi

# Find all files in the local archive directory
FILE_COUNT=$(find "$LOCAL_ARCHIVE_DIR" -type f 2>/dev/null | wc -l | tr -d ' ')
if [[ "$FILE_COUNT" -eq 0 ]]; then
    echo '{"migrated": 0, "skipped": 0, "failed": 0, "message": "No locally archived files to migrate"}'
    exit 0
fi

echo "Found $FILE_COUNT locally archived log file(s) to migrate to cloud storage" >&2

# Check for required dependencies
if ! command -v jq >/dev/null 2>&1; then
    echo '{"error": "jq not found. Install jq to enable migration"}' >&2
    exit 1
fi

if ! command -v node >/dev/null 2>&1; then
    echo '{"error": "node not found. Install Node.js to enable migration"}' >&2
    exit 1
fi

# Locate the storage.mjs script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STORAGE_SCRIPT="$SCRIPT_DIR/../../file/skills/file-manager/scripts/storage.mjs"

if [[ ! -f "$STORAGE_SCRIPT" ]]; then
    echo '{"error": "Storage script not found. File plugin not configured for cloud storage."}' >&2
    exit 1
fi

if [[ "$DRY_RUN" == "true" ]]; then
    echo "DRY RUN: Would migrate the following files:" >&2
fi

MIGRATED=0
SKIPPED=0
FAILED=0
MIGRATED_FILES="[]"
FAILED_FILES="[]"

while IFS= read -r FILE_PATH; do
    [[ -z "$FILE_PATH" ]] && continue

    # Compute relative path from local archive root
    # e.g., .fractary/logs/archive/sessions/2026-01-15-issue-123.md -> sessions/2026-01-15-issue-123.md
    REL_PATH="${FILE_PATH#$LOCAL_ARCHIVE_DIR/}"

    # Cloud archive path mirrors the same structure
    CLOUD_PATH="archive/logs/${REL_PATH}"

    FILENAME=$(basename "$FILE_PATH")

    if [[ "$DRY_RUN" == "true" ]]; then
        echo "  $FILE_PATH -> $CLOUD_PATH" >&2
        ((MIGRATED++))
        continue
    fi

    echo "Migrating: $REL_PATH -> $CLOUD_PATH" >&2

    # Upload to cloud storage via SDK
    if ! UPLOAD_RESULT=$(node "$STORAGE_SCRIPT" upload logs "$FILE_PATH" "$CLOUD_PATH" 2>&1); then
        echo "  Failed to upload: $FILE_PATH" >&2
        ((FAILED++))
        FAILED_FILES=$(echo "$FAILED_FILES" | jq --arg f "$FILE_PATH" --arg e "Upload failed" '. + [{"file": $f, "error": $e}]')
        continue
    fi

    SUCCESS=$(echo "$UPLOAD_RESULT" | jq -r '.success // false')
    if [[ "$SUCCESS" != "true" ]]; then
        ERROR=$(echo "$UPLOAD_RESULT" | jq -r '.error // "Unknown error"')
        echo "  Upload failed: $ERROR" >&2
        ((FAILED++))
        FAILED_FILES=$(echo "$FAILED_FILES" | jq --arg f "$FILE_PATH" --arg e "$ERROR" '. + [{"file": $f, "error": $e}]')
        continue
    fi

    # Verify file exists in cloud before removing local
    if ! VERIFY_RESULT=$(node "$STORAGE_SCRIPT" exists logs "$CLOUD_PATH" 2>&1); then
        echo "  Verification failed for: $CLOUD_PATH" >&2
        ((FAILED++))
        FAILED_FILES=$(echo "$FAILED_FILES" | jq --arg f "$FILE_PATH" --arg e "Verification failed" '. + [{"file": $f, "error": $e}]')
        continue
    fi

    EXISTS=$(echo "$VERIFY_RESULT" | jq -r '.exists // false')
    if [[ "$EXISTS" != "true" ]]; then
        echo "  File not found in cloud after upload: $CLOUD_PATH" >&2
        ((FAILED++))
        FAILED_FILES=$(echo "$FAILED_FILES" | jq --arg f "$FILE_PATH" --arg e "Not found in cloud after upload" '. + [{"file": $f, "error": $e}]')
        continue
    fi

    # Remove local archived file after successful cloud upload and verification
    if ! rm -f "$FILE_PATH"; then
        echo "  Warning: Failed to remove local file: $FILE_PATH" >&2
        # Non-fatal - the file is safely in cloud
    fi

    CLOUD_URL=$(echo "$UPLOAD_RESULT" | jq -r '.url // empty')
    echo "  Migrated: $CLOUD_URL" >&2

    ((MIGRATED++))
    MIGRATED_FILES=$(echo "$MIGRATED_FILES" | jq \
        --arg f "$REL_PATH" \
        --arg u "$CLOUD_URL" \
        '. + [{"file": $f, "cloud_url": $u}]')

done < <(find "$LOCAL_ARCHIVE_DIR" -type f 2>/dev/null | sort)

# Clean up empty directories in the local archive
if [[ "$DRY_RUN" != "true" ]] && [[ -d "$LOCAL_ARCHIVE_DIR" ]]; then
    find "$LOCAL_ARCHIVE_DIR" -type d -empty -delete 2>/dev/null || true
fi

MIGRATED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

if [[ "$DRY_RUN" == "true" ]]; then
    echo "DRY RUN complete: $MIGRATED files would be migrated" >&2
    cat <<EOF
{
  "dry_run": true,
  "would_migrate": $MIGRATED,
  "local_archive_dir": "$LOCAL_ARCHIVE_DIR"
}
EOF
else
    if [[ $FAILED -gt 0 ]]; then
        echo "Migration completed with errors: $MIGRATED migrated, $FAILED failed" >&2
    elif [[ $MIGRATED -gt 0 ]]; then
        echo "Migration complete: $MIGRATED file(s) migrated to cloud storage" >&2
    fi

    cat <<EOF
{
  "migrated": $MIGRATED,
  "skipped": $SKIPPED,
  "failed": $FAILED,
  "migrated_at": "$MIGRATED_AT",
  "migrated_files": $(echo "$MIGRATED_FILES" | jq -c .),
  "failed_files": $(echo "$FAILED_FILES" | jq -c .)
}
EOF
fi
