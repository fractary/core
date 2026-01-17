#!/usr/bin/env bash
#
# upload-to-cloud.sh - Upload spec to cloud storage at specified archive path
#
# Usage: upload-to-cloud.sh <spec_path> <cloud_path>
#
# Outputs JSON with upload results
#
# This script uploads directly to the specified cloud_path (e.g., archive/specs/...)
# using the specs source configuration for bucket/region info.

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

# Load common functions for config access
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FILE_PLUGIN_DIR="$SCRIPT_DIR/../../file"
COMMON_FUNCTIONS="$FILE_PLUGIN_DIR/skills/common/functions.sh"

if [[ ! -f "$COMMON_FUNCTIONS" ]]; then
    echo '{"error": "File plugin common functions not found: '"$COMMON_FUNCTIONS"'"}' >&2
    exit 1
fi

source "$COMMON_FUNCTIONS"

# Load specs source configuration to get bucket/region
echo "Loading specs source configuration..." >&2
SOURCE_CONFIG=$(load_source_config "specs")
if [[ $? -ne 0 ]]; then
    echo '{"error": "Failed to load specs source config"}' >&2
    exit 1
fi

# Extract configuration
TYPE=$(echo "$SOURCE_CONFIG" | jq -r '.type // "s3"')
BUCKET=$(echo "$SOURCE_CONFIG" | jq -r '.bucket')
REGION=$(echo "$SOURCE_CONFIG" | jq -r '.region // "us-east-1"')

if [[ -z "$BUCKET" ]] || [[ "$BUCKET" == "null" ]]; then
    echo '{"error": "No bucket configured for specs source"}' >&2
    exit 1
fi

# Locate the appropriate storage handler
HANDLER_DIR="$FILE_PLUGIN_DIR/skills/handler-storage-$TYPE"
UPLOAD_SCRIPT="$HANDLER_DIR/scripts/upload.sh"

if [[ ! -f "$UPLOAD_SCRIPT" ]]; then
    echo '{"error": "Storage handler not found: '"$UPLOAD_SCRIPT"'"}' >&2
    exit 1
fi

# Upload directly to the specified cloud_path (e.g., archive/specs/SPEC-00001.md)
echo "Uploading to cloud storage: $TYPE://$BUCKET/$CLOUD_PATH" >&2

case "$TYPE" in
    s3|r2)
        # S3/R2 handler: region, bucket, access_key, secret_key, endpoint, local_path, remote_path, public
        if ! UPLOAD_RESULT=$("$UPLOAD_SCRIPT" "$REGION" "$BUCKET" "" "" "" "$SPEC_PATH" "$CLOUD_PATH" "false" 2>&1); then
            echo '{"error": "Upload failed", "details": "'"$(echo "$UPLOAD_RESULT" | tr '\n' ' ' | sed 's/"/\\"/g')"'"}' >&2
            exit 1
        fi
        ;;
    gcs)
        PROJECT_ID=$(echo "$SOURCE_CONFIG" | jq -r '.project_id // ""')
        if ! UPLOAD_RESULT=$("$UPLOAD_SCRIPT" "$PROJECT_ID" "$BUCKET" "$SPEC_PATH" "$CLOUD_PATH" 2>&1); then
            echo '{"error": "Upload failed", "details": "'"$(echo "$UPLOAD_RESULT" | tr '\n' ' ' | sed 's/"/\\"/g')"'"}' >&2
            exit 1
        fi
        ;;
    *)
        echo '{"error": "Unsupported storage type: '"$TYPE"'"}' >&2
        exit 1
        ;;
esac

# Parse upload result
CLOUD_URL=$(echo "$UPLOAD_RESULT" | jq -r '.url // empty')
SIZE_BYTES=$(echo "$UPLOAD_RESULT" | jq -r '.size_bytes // 0')
CHECKSUM=$(echo "$UPLOAD_RESULT" | jq -r '.checksum // "unknown"')
UPLOADED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

if [[ -z "$CLOUD_URL" ]]; then
    echo '{"error": "Upload completed but no URL returned", "details": "'"$(echo "$UPLOAD_RESULT" | tr '\n' ' ' | sed 's/"/\\"/g')"'"}' >&2
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
  "original_path": "$SPEC_PATH",
  "original_deleted": true,
  "cloud_path": "$CLOUD_PATH",
  "cloud_url": "$CLOUD_URL",
  "size_bytes": $SIZE_BYTES,
  "checksum": "$CHECKSUM",
  "uploaded_at": "$UPLOADED_AT"
}
EOF
