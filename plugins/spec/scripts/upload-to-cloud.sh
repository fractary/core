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

# Validate cloud_path to prevent directory traversal attacks
if [[ "$CLOUD_PATH" =~ \.\. ]] || [[ "$CLOUD_PATH" =~ ^/ ]]; then
    echo '{"error": "Invalid cloud path: cannot contain .. or start with /"}' >&2
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
    s3)
        # S3 handler: region, bucket, access_key, secret_key, endpoint, local_path, remote_path, public
        if ! UPLOAD_RESULT=$("$UPLOAD_SCRIPT" "$REGION" "$BUCKET" "" "" "" "$SPEC_PATH" "$CLOUD_PATH" "false" 2>&1); then
            echo '{"error": "Upload failed", "details": "'"$(echo "$UPLOAD_RESULT" | tr '\n' ' ' | sed 's/"/\\"/g')"'"}' >&2
            exit 1
        fi
        ;;
    r2)
        # R2 handler: account_id, bucket_name, access_key, secret_key, local_path, remote_path, public, public_url
        ACCOUNT_ID=$(echo "$SOURCE_CONFIG" | jq -r '.account_id // ""')
        if [[ -z "$ACCOUNT_ID" ]]; then
            echo '{"error": "No account_id configured for R2 storage"}' >&2
            exit 1
        fi
        if ! UPLOAD_RESULT=$("$UPLOAD_SCRIPT" "$ACCOUNT_ID" "$BUCKET" "" "" "$SPEC_PATH" "$CLOUD_PATH" "false" "" 2>&1); then
            echo '{"error": "Upload failed", "details": "'"$(echo "$UPLOAD_RESULT" | tr '\n' ' ' | sed 's/"/\\"/g')"'"}' >&2
            exit 1
        fi
        ;;
    gcs)
        # GCS handler: project_id, bucket_name, service_account_key, region, local_path, remote_path, public
        PROJECT_ID=$(echo "$SOURCE_CONFIG" | jq -r '.project_id // ""')
        SERVICE_ACCOUNT_KEY=$(echo "$SOURCE_CONFIG" | jq -r '.service_account_key // ""')
        if [[ -z "$PROJECT_ID" ]]; then
            echo '{"error": "No project_id configured for GCS storage"}' >&2
            exit 1
        fi
        if ! UPLOAD_RESULT=$("$UPLOAD_SCRIPT" "$PROJECT_ID" "$BUCKET" "$SERVICE_ACCOUNT_KEY" "$REGION" "$SPEC_PATH" "$CLOUD_PATH" "false" 2>&1); then
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

# Verify checksum before deleting original file
if [[ "$CHECKSUM" != "unknown" ]]; then
    LOCAL_CHECKSUM=$(sha256sum "$SPEC_PATH" 2>/dev/null | awk '{print $1}')
    # Extract hex checksum from "sha256:..." format
    UPLOADED_CHECKSUM="${CHECKSUM#sha256:}"

    if [[ "$LOCAL_CHECKSUM" != "$UPLOADED_CHECKSUM" ]]; then
        echo '{"error": "Checksum verification failed: upload may be corrupted"}' >&2
        echo "  Local: $LOCAL_CHECKSUM" >&2
        echo "  Remote: $UPLOADED_CHECKSUM" >&2
        exit 1
    fi
    echo "✓ Checksum verified: $LOCAL_CHECKSUM" >&2
fi

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
