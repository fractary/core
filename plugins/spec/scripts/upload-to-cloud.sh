#!/usr/bin/env bash
#
# upload-to-cloud.sh - Upload spec to cloud storage at specified archive path
#
# Usage: upload-to-cloud.sh <spec_path> <cloud_path>
#
# Outputs JSON with upload results
#
# This script uploads directly to the specified cloud_path (e.g., archive/specs/...)
# using the specs source configuration via the @fractary/core SDK.

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

# Check for node dependency
if ! command -v node >/dev/null 2>&1; then
    echo '{"error": "node not found. Install Node.js to enable cloud uploads"}' >&2
    exit 1
fi

# Locate the storage.mjs script (SDK-based file operations)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STORAGE_SCRIPT="$SCRIPT_DIR/../../file/scripts/storage.mjs"

if [[ ! -f "$STORAGE_SCRIPT" ]]; then
    echo '{"error": "Storage script not found: '"$STORAGE_SCRIPT"'"}' >&2
    exit 1
fi

# Validate cloud_path to prevent directory traversal attacks
if [[ "$CLOUD_PATH" =~ \.\. ]] || [[ "$CLOUD_PATH" =~ ^/ ]]; then
    echo '{"error": "Invalid cloud path: cannot contain .. or start with /"}' >&2
    exit 1
fi

echo "Uploading to cloud storage: specs source -> $CLOUD_PATH" >&2

# Upload using SDK via storage.mjs
# Usage: node storage.mjs upload <source> <local-path> <remote-path>
if ! UPLOAD_RESULT=$(node "$STORAGE_SCRIPT" upload specs "$SPEC_PATH" "$CLOUD_PATH" 2>&1); then
    echo '{"error": "Upload failed", "details": "'"$(echo "$UPLOAD_RESULT" | tr '\n' ' ' | sed 's/"/\\"/g')"'"}' >&2
    exit 1
fi

# Check if upload was successful
SUCCESS=$(echo "$UPLOAD_RESULT" | jq -r '.success // false')
if [[ "$SUCCESS" != "true" ]]; then
    ERROR=$(echo "$UPLOAD_RESULT" | jq -r '.error // "Unknown error"')
    echo '{"error": "Upload failed", "details": "'"$ERROR"'"}' >&2
    exit 1
fi

# Parse upload result
CLOUD_URL=$(echo "$UPLOAD_RESULT" | jq -r '.url // empty')
SIZE_BYTES=$(echo "$UPLOAD_RESULT" | jq -r '.size_bytes // 0')
CHECKSUM=$(echo "$UPLOAD_RESULT" | jq -r '.checksum // "unknown"')
UPLOADED_AT=$(echo "$UPLOAD_RESULT" | jq -r '.uploaded_at // empty')

if [[ -z "$CLOUD_URL" ]]; then
    echo '{"error": "Upload completed but no URL returned", "details": "'"$(echo "$UPLOAD_RESULT" | tr '\n' ' ' | sed 's/"/\\"/g')"'"}' >&2
    exit 1
fi

echo "✓ Upload successful: $CLOUD_URL" >&2

# Verify file exists in cloud storage before deleting local
echo "Verifying upload..." >&2
if ! VERIFY_RESULT=$(node "$STORAGE_SCRIPT" exists specs "$CLOUD_PATH" 2>&1); then
    echo '{"error": "Upload verification failed", "details": "'"$(echo "$VERIFY_RESULT" | tr '\n' ' ' | sed 's/"/\\"/g')"'"}' >&2
    exit 13  # Exit code 13 = verification failed
fi

EXISTS=$(echo "$VERIFY_RESULT" | jq -r '.exists // false')
if [[ "$EXISTS" != "true" ]]; then
    echo '{"error": "Upload verification failed: file not found in cloud storage after upload"}' >&2
    exit 13
fi

echo "✓ Upload verified: file exists in cloud storage" >&2

# Delete original file after successful upload and verification
if ! rm -f "$SPEC_PATH"; then
    echo "Warning: Failed to remove original file: $SPEC_PATH" >&2
    # Continue anyway - the upload was successful
fi

echo "✓ Original file removed: $SPEC_PATH" >&2

# Output result in expected format (matches spec plugin expectations)
cat <<EOF
{
  "filename": "$FILENAME",
  "original_path": "$SPEC_PATH",
  "original_deleted": true,
  "cloud_path": "$CLOUD_PATH",
  "cloud_url": "$CLOUD_URL",
  "size_bytes": $SIZE_BYTES,
  "checksum": "$CHECKSUM",
  "uploaded_at": "$UPLOADED_AT"
}
EOF
