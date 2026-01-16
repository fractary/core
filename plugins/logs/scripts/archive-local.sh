#!/usr/bin/env bash
#
# archive-local.sh - Archive log to local archive directory
#
# Usage: archive-local.sh <log_path> <archive_path>
#
# Outputs JSON with archive results
#
# This script provides local archiving as a fallback when cloud storage
# is not configured. Archived logs are moved to .fractary/logs/archive/
# which is gitignored to keep them out of source control while preserving
# them locally for reference.

set -euo pipefail

LOG_PATH="${1:?Log path required}"
ARCHIVE_PATH="${2:?Archive path required}"

# Path traversal protection: ensure archive path is within expected directory
EXPECTED_ARCHIVE_ROOT=".fractary/logs/archive"
RESOLVED_ARCHIVE_PATH=$(realpath -m "$ARCHIVE_PATH" 2>/dev/null || echo "$ARCHIVE_PATH")
RESOLVED_ARCHIVE_ROOT=$(realpath -m "$EXPECTED_ARCHIVE_ROOT" 2>/dev/null || echo "$EXPECTED_ARCHIVE_ROOT")
if [[ "$RESOLVED_ARCHIVE_PATH" != "$RESOLVED_ARCHIVE_ROOT"* ]]; then
    echo '{"error": "Path traversal detected: archive path must be within '"$EXPECTED_ARCHIVE_ROOT"'", "path": "'"$ARCHIVE_PATH"'"}' >&2
    exit 1
fi

# Validate log exists
if [[ ! -f "$LOG_PATH" ]]; then
    echo '{"error": "Log file not found", "path": "'"$LOG_PATH"'"}' >&2
    exit 1
fi

# Get file info for metadata
FILENAME=$(basename "$LOG_PATH")
FILE_SIZE=$(stat -c%s "$LOG_PATH" 2>/dev/null || stat -f%z "$LOG_PATH" 2>/dev/null || echo "0")

# Compute checksum - fail explicitly if neither tool is available
if command -v sha256sum >/dev/null 2>&1; then
    CHECKSUM=$(sha256sum "$LOG_PATH" | cut -d' ' -f1)
elif command -v shasum >/dev/null 2>&1; then
    CHECKSUM=$(shasum -a 256 "$LOG_PATH" | cut -d' ' -f1)
else
    echo '{"error": "No checksum tool available (need sha256sum or shasum)"}' >&2
    exit 1
fi

# Create archive directory if it doesn't exist
ARCHIVE_DIR=$(dirname "$ARCHIVE_PATH")
if [[ ! -d "$ARCHIVE_DIR" ]]; then
    echo "Creating archive directory: $ARCHIVE_DIR" >&2
    mkdir -p "$ARCHIVE_DIR"
fi

# Check if archive file already exists
if [[ -f "$ARCHIVE_PATH" ]]; then
    echo "Warning: Archive file already exists, will overwrite: $ARCHIVE_PATH" >&2
fi

# Move (copy then delete) to archive location
echo "Archiving to local storage: $ARCHIVE_PATH" >&2
if ! cp "$LOG_PATH" "$ARCHIVE_PATH"; then
    echo '{"error": "Failed to copy log to archive", "source": "'"$LOG_PATH"'", "destination": "'"$ARCHIVE_PATH"'"}' >&2
    exit 1
fi

# Verify copy succeeded
if [[ ! -f "$ARCHIVE_PATH" ]]; then
    echo '{"error": "Archive file not created", "path": "'"$ARCHIVE_PATH"'"}' >&2
    exit 1
fi

# Verify checksums match (using same tool as original)
if command -v sha256sum >/dev/null 2>&1; then
    ARCHIVE_CHECKSUM=$(sha256sum "$ARCHIVE_PATH" | cut -d' ' -f1)
else
    ARCHIVE_CHECKSUM=$(shasum -a 256 "$ARCHIVE_PATH" | cut -d' ' -f1)
fi

if [[ "$CHECKSUM" != "$ARCHIVE_CHECKSUM" ]]; then
    echo '{"error": "Checksum mismatch after copy", "original": "'"$CHECKSUM"'", "archived": "'"$ARCHIVE_CHECKSUM"'"}' >&2
    rm -f "$ARCHIVE_PATH"
    exit 1
fi

# Delete original file after successful copy and verification
if ! rm -f "$LOG_PATH"; then
    echo "Warning: Failed to remove original file: $LOG_PATH" >&2
    # Continue anyway - the archive was successful
fi

ARCHIVED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "✓ Local archive successful: $ARCHIVE_PATH (original removed)" >&2

# Output result in expected format (matches logs plugin expectations)
cat <<EOF
{
  "filename": "$FILENAME",
  "source_path": "$LOG_PATH",
  "archive_path": "$ARCHIVE_PATH",
  "size_bytes": $FILE_SIZE,
  "checksum": "sha256:$CHECKSUM",
  "archived_at": "$ARCHIVED_AT",
  "archive_mode": "local"
}
EOF
