#!/usr/bin/env bash
#
# upload-to-cloud.sh - Upload log file to cloud storage
#
# Usage: upload-to-cloud.sh <log_path> <cloud_path>
#
# Outputs JSON with upload results
#
# This script integrates with fractary-file plugin's S3 handler

set -euo pipefail

LOG_PATH="${1:?Log path required}"
CLOUD_PATH="${2:?Cloud path required}"

# Validate log file exists
if [[ ! -f "$LOG_PATH" ]]; then
    echo '{"error": "Log file not found"}' >&2
    exit 1
fi

# Get file info (portable across macOS and Linux)
FILENAME=$(basename "$LOG_PATH")
if command -v stat >/dev/null 2>&1; then
    # Try GNU stat first, fall back to BSD stat (macOS)
    SIZE=$(stat -c %s "$LOG_PATH" 2>/dev/null || stat -f %z "$LOG_PATH" 2>/dev/null || wc -c < "$LOG_PATH" | tr -d ' ')
else
    SIZE=$(wc -c < "$LOG_PATH" | tr -d ' ')
fi
CHECKSUM=$(sha256sum "$LOG_PATH" 2>/dev/null || shasum -a 256 "$LOG_PATH" | awk '{print $1}')

# Determine if compressed
COMPRESSED="false"
if [[ "$FILENAME" =~ \.gz$ ]]; then
    COMPRESSED="true"
fi

# Load file plugin configuration
FILE_CONFIG=".fractary/plugins/file/config.json"

if [[ ! -f "$FILE_CONFIG" ]]; then
    echo '{"error": "File plugin not configured. Run: claude /fractary-file:init"}' >&2
    exit 1
fi

# Check for jq dependency
if ! command -v jq >/dev/null 2>&1; then
    echo '{"error": "jq not found. Install jq to enable S3 uploads"}' >&2
    exit 1
fi

# Extract S3 handler configuration
REGION=$(jq -r '.handlers.s3.region // empty' "$FILE_CONFIG")
BUCKET=$(jq -r '.handlers.s3.bucket_name // empty' "$FILE_CONFIG")
AUTH_METHOD=$(jq -r '.handlers.s3.auth_method // "profile"' "$FILE_CONFIG")

if [[ -z "$REGION" ]] || [[ -z "$BUCKET" ]]; then
    echo '{"error": "S3 handler not configured. Check .fractary/plugins/file/config.json"}' >&2
    exit 1
fi

# Extract credentials based on auth method
ACCESS_KEY=""
SECRET_KEY=""
ENDPOINT=""

if [[ "$AUTH_METHOD" == "profile" ]]; then
    PROFILE=$(jq -r '.handlers.s3.profile // "default"' "$FILE_CONFIG")
    export AWS_PROFILE="$PROFILE"
elif [[ "$AUTH_METHOD" == "keys" ]]; then
    ACCESS_KEY=$(jq -r '.handlers.s3.access_key_id // ""' "$FILE_CONFIG")
    SECRET_KEY=$(jq -r '.handlers.s3.secret_access_key // ""' "$FILE_CONFIG")
    # Expand environment variables if present
    ACCESS_KEY=$(eval echo "$ACCESS_KEY")
    SECRET_KEY=$(eval echo "$SECRET_KEY")
fi

ENDPOINT=$(jq -r '.handlers.s3.endpoint // ""' "$FILE_CONFIG")
PUBLIC="false"

# Locate S3 upload script
UPLOAD_SCRIPT="plugins/file/skills/handler-storage-s3/scripts/upload.sh"
if [[ ! -f "$UPLOAD_SCRIPT" ]]; then
    echo '{"error": "S3 upload script not found: '"$UPLOAD_SCRIPT"'"}' >&2
    exit 1
fi

# Call S3 upload handler
echo "Uploading to S3: s3://${BUCKET}/${CLOUD_PATH}" >&2

if ! UPLOAD_RESULT=$("$UPLOAD_SCRIPT" "$REGION" "$BUCKET" "$ACCESS_KEY" "$SECRET_KEY" \
                                      "$ENDPOINT" "$LOG_PATH" "$CLOUD_PATH" "$PUBLIC" 2>&1); then
    echo '{"error": "S3 upload failed", "details": "'"$(echo "$UPLOAD_RESULT" | tr '\n' ' ' | sed 's/"/\\"/g')"'"}' >&2
    exit 1
fi

# Parse upload result
CLOUD_URL=$(echo "$UPLOAD_RESULT" | jq -r '.url // empty')

if [[ -z "$CLOUD_URL" ]]; then
    echo '{"error": "Upload completed but no URL returned", "details": "'"$(echo "$UPLOAD_RESULT" | tr '\n' ' ' | sed 's/"/\\"/g')"'"}' >&2
    exit 1
fi

echo "✓ Upload successful: $CLOUD_URL" >&2

# Output result
cat <<EOF
{
  "filename": "$FILENAME",
  "local_path": "$LOG_PATH",
  "cloud_path": "$CLOUD_PATH",
  "cloud_url": "$CLOUD_URL",
  "size_bytes": $SIZE,
  "compressed": $COMPRESSED,
  "checksum": "sha256:$CHECKSUM",
  "uploaded_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
