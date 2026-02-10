#!/bin/bash
# Remove local logs after successful archive
#
# NOTE: This script previously relied on the archive index (.archive-index.json)
# to determine which files to clean up. The archive index is now DEPRECATED.
# Cloud storage is the source of truth.
#
# This script now accepts a list of file paths via stdin or as the second argument
# (JSON array of paths). If neither is provided and an issue number is given,
# it will search for log files matching that issue number in the logs directory.
set -euo pipefail

ISSUE_NUMBER="${1:?Issue number required}"
LOG_PATHS_JSON="${2:-}"
CONFIG_FILE="${FRACTARY_LOGS_CONFIG:-.fractary/config.yaml (logs section)}"

# Load configuration
if [[ ! -f "$CONFIG_FILE" ]]; then
    echo "Error: Configuration not found at $CONFIG_FILE" >&2
    exit 1
fi

LOG_DIR=$(jq -r '.storage.local_path // "/logs"' "$CONFIG_FILE")

# Determine which files to clean up
if [[ -n "$LOG_PATHS_JSON" ]]; then
    # Use provided JSON array of paths
    ARCHIVED_LOGS=$(echo "$LOG_PATHS_JSON" | jq -r '.[]' 2>/dev/null || echo "$LOG_PATHS_JSON")
else
    # Search for log files matching issue number in the logs directory
    ARCHIVED_LOGS=$(find "$LOG_DIR" -type f \( -name "*${ISSUE_NUMBER}*" \) -not -path "*/archive/*" 2>/dev/null || true)
fi

if [[ -z "$ARCHIVED_LOGS" ]]; then
    echo "No log files found for issue #$ISSUE_NUMBER"
    exit 0
fi

# Remove each log file
DELETED_COUNT=0
FREED_BYTES=0
FAILED_FILES=()

while IFS= read -r LOG_FILE; do
    if [[ -f "$LOG_FILE" ]]; then
        # Get file size before deletion
        SIZE=$(stat -c%s "$LOG_FILE" 2>/dev/null || stat -f%z "$LOG_FILE" 2>/dev/null || echo "0")

        # Delete file
        if rm "$LOG_FILE" 2>/dev/null; then
            ((DELETED_COUNT++))
            FREED_BYTES=$((FREED_BYTES + SIZE))
            echo "Deleted: $LOG_FILE"
        else
            FAILED_FILES+=("$LOG_FILE")
            echo "Warning: Failed to delete $LOG_FILE" >&2
        fi

        # Also remove compressed version if exists
        if [[ -f "${LOG_FILE}.gz" ]]; then
            rm "${LOG_FILE}.gz" 2>/dev/null || true
        fi
    fi
done <<< "$ARCHIVED_LOGS"

# Report results
echo "Cleanup complete for issue #$ISSUE_NUMBER"
echo "Deleted: $DELETED_COUNT files"
echo "Freed: $((FREED_BYTES / 1024)) KB"

if [[ ${#FAILED_FILES[@]} -gt 0 ]]; then
    echo "Failed to delete ${#FAILED_FILES[@]} files:" >&2
    printf '%s\n' "${FAILED_FILES[@]}" >&2
    exit 1
fi
