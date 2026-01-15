#!/bin/bash
# File Plugin - Push Operation
# Uploads local file to cloud storage based on source configuration
# Usage: push.sh <file_path> [source_name]

set -euo pipefail

# Get script directory and load common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
source "$PLUGIN_DIR/skills/common/functions.sh"

# Parse arguments
FILE_PATH="$1"
SOURCE_NAME="${2:-}"

if [[ -z "$FILE_PATH" ]]; then
    echo "Error: File path required" >&2
    echo "Usage: push.sh <file_path> [source_name]" >&2
    exit 1
fi

# Validate path to prevent directory traversal attacks
if ! validate_path "$FILE_PATH"; then
    echo "Error: Invalid or unsafe file path" >&2
    exit 1
fi

# Check if file exists
if [[ ! -f "$FILE_PATH" ]]; then
    echo "Error: File not found: $FILE_PATH" >&2
    exit 1
fi

# Resolve source if not provided
if [[ -z "$SOURCE_NAME" ]]; then
    SOURCE_NAME=$(resolve_source "$FILE_PATH")
    if [[ $? -ne 0 ]]; then
        echo "Error: Could not resolve source for file: $FILE_PATH" >&2
        echo "Hint: Specify source explicitly with: push.sh <file_path> <source_name>" >&2
        exit 1
    fi
    echo "Resolved source: $SOURCE_NAME" >&2
fi

# Load source configuration
SOURCE_CONFIG=$(load_source_config "$SOURCE_NAME")
if [[ $? -ne 0 ]]; then
    echo "Error: Failed to load source config for: $SOURCE_NAME" >&2
    exit 1
fi

# Extract configuration values
TYPE=$(echo "$SOURCE_CONFIG" | jq -r '.type // "s3"')
BUCKET=$(echo "$SOURCE_CONFIG" | jq -r '.bucket')
PREFIX=$(echo "$SOURCE_CONFIG" | jq -r '.prefix // ""')
REGION=$(echo "$SOURCE_CONFIG" | jq -r '.region // "us-east-1"')
COMPRESS=$(echo "$SOURCE_CONFIG" | jq -r '.push.compress // false')
KEEP_LOCAL=$(echo "$SOURCE_CONFIG" | jq -r '.push.keep_local // true')
AUTH_PROFILE=$(echo "$SOURCE_CONFIG" | jq -r '.auth.profile // "default"')

# Get base filename
FILENAME=$(basename "$FILE_PATH")
LOCAL_PATH="$FILE_PATH"
COMPRESSED=false

# Compress if configured
if [[ "$COMPRESS" == "true" ]]; then
    echo "Compressing file..." >&2

    # Atomic operation: compress and verify in single step to prevent TOCTOU
    COMPRESSED_FILE="${FILE_PATH}.gz"
    if gzip -c "$FILE_PATH" > "$COMPRESSED_FILE" && [[ -s "$COMPRESSED_FILE" ]]; then
        LOCAL_PATH="$COMPRESSED_FILE"
        FILENAME="${FILENAME}.gz"
        COMPRESSED=true
    else
        # Compression or verification failed
        echo "Error: Compression failed or resulted in empty file" >&2
        rm -f "$COMPRESSED_FILE"  # Clean up partial file
        exit 1
    fi
fi

# Determine remote path
REMOTE_PATH="${PREFIX}${FILENAME}"

# Route to appropriate handler based on type
case "$TYPE" in
    s3)
        HANDLER_DIR="$PLUGIN_DIR/skills/handler-storage-s3"
        UPLOAD_SCRIPT="$HANDLER_DIR/scripts/upload.sh"

        if [[ ! -f "$UPLOAD_SCRIPT" ]]; then
            echo "Error: S3 handler not found: $UPLOAD_SCRIPT" >&2
            exit 1
        fi

        # Call S3 handler
        # Usage: upload.sh <region> <bucket> <access_key> <secret_key> <endpoint> <local_path> <remote_path> <public>
        RESULT=$("$UPLOAD_SCRIPT" "$REGION" "$BUCKET" "" "" "" "$LOCAL_PATH" "$REMOTE_PATH" "false")
        ;;

    r2)
        HANDLER_DIR="$PLUGIN_DIR/skills/handler-storage-r2"
        UPLOAD_SCRIPT="$HANDLER_DIR/scripts/upload.sh"

        if [[ ! -f "$UPLOAD_SCRIPT" ]]; then
            echo "Error: R2 handler not found: $UPLOAD_SCRIPT" >&2
            exit 1
        fi

        # Call R2 handler (similar to S3)
        RESULT=$("$UPLOAD_SCRIPT" "$REGION" "$BUCKET" "" "" "" "$LOCAL_PATH" "$REMOTE_PATH" "false")
        ;;

    gcs)
        HANDLER_DIR="$PLUGIN_DIR/skills/handler-storage-gcs"
        UPLOAD_SCRIPT="$HANDLER_DIR/scripts/upload.sh"

        if [[ ! -f "$UPLOAD_SCRIPT" ]]; then
            echo "Error: GCS handler not found: $UPLOAD_SCRIPT" >&2
            exit 1
        fi

        # Call GCS handler
        PROJECT_ID=$(echo "$SOURCE_CONFIG" | jq -r '.project_id // ""')
        RESULT=$("$UPLOAD_SCRIPT" "$PROJECT_ID" "$BUCKET" "$LOCAL_PATH" "$REMOTE_PATH")
        ;;

    local)
        # Local "push" is just a copy
        BASE_PATH=$(echo "$SOURCE_CONFIG" | jq -r '.local.base_path')
        DEST_PATH="${BASE_PATH}/${FILENAME}"
        mkdir -p "$(dirname "$DEST_PATH")"
        cp "$LOCAL_PATH" "$DEST_PATH"

        # Create result JSON
        SIZE=$(get_file_size "$DEST_PATH")
        CHECKSUM=$(calculate_checksum "$DEST_PATH")
        RESULT=$(jq -n \
            --arg url "file://$DEST_PATH" \
            --arg size "$SIZE" \
            --arg checksum "sha256:$CHECKSUM" \
            '{url: $url, size_bytes: ($size | tonumber), checksum: $checksum}')
        ;;

    *)
        echo "Error: Unsupported storage type: $TYPE" >&2
        exit 1
        ;;
esac

# Handle keep_local setting
if [[ "$KEEP_LOCAL" == "false" ]]; then
    echo "Removing local file (keep_local=false)..." >&2
    rm -f "$FILE_PATH"
    if [[ "$COMPRESSED" == "true" ]]; then
        rm -f "${FILE_PATH}.gz"
    fi
fi

# Parse result and add metadata
CLOUD_URL=$(echo "$RESULT" | jq -r '.url')
SIZE_BYTES=$(echo "$RESULT" | jq -r '.size_bytes')
CHECKSUM=$(echo "$RESULT" | jq -r '.checksum // "unknown"')
UPLOADED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Return comprehensive result
jq -n \
    --arg source "$SOURCE_NAME" \
    --arg local_path "$FILE_PATH" \
    --arg cloud_url "$CLOUD_URL" \
    --arg public_url "$CLOUD_URL" \
    --arg size "$SIZE_BYTES" \
    --arg compressed "$COMPRESSED" \
    --arg checksum "$CHECKSUM" \
    --arg uploaded_at "$UPLOADED_AT" \
    '{
        source: $source,
        local_path: $local_path,
        cloud_url: $cloud_url,
        public_url: $public_url,
        size_bytes: ($size | tonumber),
        compressed: ($compressed | test("true")),
        checksum: $checksum,
        uploaded_at: $uploaded_at
    }'
