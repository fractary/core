#!/usr/bin/env bash
#
# upload-to-cloud.sh - Upload spec to cloud storage
#
# Usage: upload-to-cloud.sh <spec_path> <cloud_path>
#
# Outputs JSON with upload results
#
# This script uses fractary-file plugin's push operation

set -euo pipefail

SPEC_PATH="${1:?Spec path required}"
CLOUD_PATH="${2:?Cloud path required}"

# Validate spec exists
if [[ ! -f "$SPEC_PATH" ]]; then
    echo '{"error": "Spec file not found"}' >&2
    exit 1
fi

# Get file info for metadata
FILENAME=$(basename "$SPEC_PATH")

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

# Call file plugin push operation (auto-resolves to 'specs' source)
echo "Uploading to cloud storage via file plugin..." >&2

if ! PUSH_RESULT=$("$PUSH_SCRIPT" "$SPEC_PATH" "specs" 2>&1); then
    echo '{"error": "Upload failed", "details": "'"$(echo "$PUSH_RESULT" | tr '\n' ' ' | sed 's/"/\\"/g')"'"}' >&2
    exit 1
fi

# Parse push result
CLOUD_URL=$(echo "$PUSH_RESULT" | jq -r '.cloud_url // empty')
SIZE_BYTES=$(echo "$PUSH_RESULT" | jq -r '.size_bytes // 0')
CHECKSUM=$(echo "$PUSH_RESULT" | jq -r '.checksum // "unknown"')
UPLOADED_AT=$(echo "$PUSH_RESULT" | jq -r '.uploaded_at // ""')

if [[ -z "$CLOUD_URL" ]]; then
    echo '{"error": "Upload completed but no URL returned", "details": "'"$(echo "$PUSH_RESULT" | tr '\n' ' ' | sed 's/"/\\"/g')"'"}' >&2
    exit 1
fi

echo "✓ Upload successful: $CLOUD_URL" >&2

# Delete original file after successful upload (consistent with archive-local.sh behavior)
if ! rm -f "$SPEC_PATH"; then
    echo "Warning: Failed to remove original file: $SPEC_PATH" >&2
    # Continue anyway - the upload was successful
fi

echo "✓ Original file removed: $SPEC_PATH" >&2

# Output result in expected format (matches spec plugin expectations)
cat <<EOF
{
  "filename": "$FILENAME",
  "local_path": "$SPEC_PATH",
  "cloud_path": "$CLOUD_PATH",
  "cloud_url": "$CLOUD_URL",
  "size_bytes": $SIZE_BYTES,
  "checksum": "$CHECKSUM",
  "uploaded_at": "$UPLOADED_AT",
  "mock_upload": false
}
EOF
