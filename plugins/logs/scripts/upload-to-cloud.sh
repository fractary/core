#!/usr/bin/env bash
#
# upload-to-cloud.sh - Upload log file to cloud storage
#
# Usage: upload-to-cloud.sh <log_path> <cloud_path>
#
# Outputs JSON with upload results
#
# This script uses fractary-file plugin's push operation

set -euo pipefail

LOG_PATH="${1:?Log path required}"
CLOUD_PATH="${2:?Cloud path required}"

# Validate log file exists
if [[ ! -f "$LOG_PATH" ]]; then
    echo '{"error": "Log file not found"}' >&2
    exit 1
fi

# Get file info for metadata
FILENAME=$(basename "$LOG_PATH")

# Determine if already compressed
COMPRESSED="false"
if [[ "$FILENAME" =~ \.gz$ ]]; then
    COMPRESSED="true"
fi

# Check for jq dependency
if ! command -v jq >/dev/null 2>&1; then
    echo '{"error": "jq not found. Install jq to enable cloud uploads"}' >&2
    exit 1
fi

# Locate push script
PUSH_SCRIPT="plugins/file/skills/file-manager/scripts/push.sh"
if [[ ! -f "$PUSH_SCRIPT" ]]; then
    echo '{"error": "File plugin push script not found: '"$PUSH_SCRIPT"'"}' >&2
    exit 1
fi

# Call file plugin push operation (auto-resolves to 'logs' source)
echo "Uploading to cloud storage via file plugin..." >&2

if ! PUSH_RESULT=$("$PUSH_SCRIPT" "$LOG_PATH" "logs" 2>&1); then
    echo '{"error": "Upload failed", "details": "'"$(echo "$PUSH_RESULT" | tr '\n' ' ' | sed 's/"/\\"/g')"'"}' >&2
    exit 1
fi

# Parse push result
CLOUD_URL=$(echo "$PUSH_RESULT" | jq -r '.cloud_url // empty')
SIZE_BYTES=$(echo "$PUSH_RESULT" | jq -r '.size_bytes // 0')
CHECKSUM=$(echo "$PUSH_RESULT" | jq -r '.checksum // "unknown"')
UPLOADED_AT=$(echo "$PUSH_RESULT" | jq -r '.uploaded_at // ""')
WAS_COMPRESSED=$(echo "$PUSH_RESULT" | jq -r '.compressed // false')

# Use compression status from push result if file was compressed during push
if [[ "$WAS_COMPRESSED" == "true" ]]; then
    COMPRESSED="true"
fi

if [[ -z "$CLOUD_URL" ]]; then
    echo '{"error": "Upload completed but no URL returned", "details": "'"$(echo "$PUSH_RESULT" | tr '\n' ' ' | sed 's/"/\\"/g')"'"}' >&2
    exit 1
fi

echo "✓ Upload successful: $CLOUD_URL" >&2

# Output result in expected format (matches logs plugin expectations)
cat <<EOF
{
  "filename": "$FILENAME",
  "local_path": "$LOG_PATH",
  "cloud_path": "$CLOUD_PATH",
  "cloud_url": "$CLOUD_URL",
  "size_bytes": $SIZE_BYTES,
  "compressed": $COMPRESSED,
  "checksum": "$CHECKSUM",
  "uploaded_at": "$UPLOADED_AT"
}
EOF
