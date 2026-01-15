#!/bin/bash
# File Plugin - Pull Operation
# Downloads file from cloud storage to local based on source configuration
# Usage: pull.sh <file_path> [source_name] [--force]

set -euo pipefail

# Get script directory and load common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
source "$PLUGIN_DIR/skills/common/functions.sh"

# Parse arguments
FILE_PATH="$1"
SOURCE_NAME="${2:-}"
FORCE_FLAG="${3:-}"

if [[ -z "$FILE_PATH" ]]; then
    echo "Error: File path required" >&2
    echo "Usage: pull.sh <file_path> [source_name] [--force]" >&2
    exit 1
fi

# Check for --force flag in any position
if [[ "$SOURCE_NAME" == "--force" ]] || [[ "$FORCE_FLAG" == "--force" ]]; then
    FORCE=true
    # If source_name was --force, clear it
    if [[ "$SOURCE_NAME" == "--force" ]]; then
        SOURCE_NAME=""
    fi
else
    FORCE=false
fi

# Resolve source if not provided
if [[ -z "$SOURCE_NAME" ]]; then
    SOURCE_NAME=$(resolve_source "$FILE_PATH")
    if [[ $? -ne 0 ]]; then
        echo "Error: Could not resolve source for file: $FILE_PATH" >&2
        echo "Hint: Specify source explicitly with: pull.sh <file_path> <source_name>" >&2
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
BASE_PATH=$(echo "$SOURCE_CONFIG" | jq -r '.local.base_path')

# Determine local and remote paths
FILENAME=$(basename "$FILE_PATH")
LOCAL_PATH="${BASE_PATH}/${FILENAME}"

# Check if file already exists locally
if [[ -f "$LOCAL_PATH" ]] && [[ "$FORCE" != "true" ]]; then
    echo "File already exists locally: $LOCAL_PATH" >&2
    echo "Use --force to overwrite" >&2

    # Return success with existing file info
    SIZE=$(get_file_size "$LOCAL_PATH")
    CHECKSUM=$(calculate_checksum "$LOCAL_PATH")
    jq -n \
        --arg source "$SOURCE_NAME" \
        --arg local_path "$LOCAL_PATH" \
        --arg status "already_exists" \
        --arg size "$SIZE" \
        --arg checksum "sha256:$CHECKSUM" \
        '{
            source: $source,
            local_path: $local_path,
            status: $status,
            size_bytes: ($size | tonumber),
            checksum: $checksum
        }'
    exit 0
fi

# Determine remote path (may include .gz extension)
REMOTE_PATH="${PREFIX}${FILENAME}"
COMPRESSED_REMOTE="${PREFIX}${FILENAME}.gz"

# Create local directory if needed
mkdir -p "$(dirname "$LOCAL_PATH")"

# Route to appropriate handler based on type
case "$TYPE" in
    s3)
        HANDLER_DIR="$PLUGIN_DIR/skills/handler-storage-s3"
        DOWNLOAD_SCRIPT="$HANDLER_DIR/scripts/download.sh"

        if [[ ! -f "$DOWNLOAD_SCRIPT" ]]; then
            echo "Error: S3 handler not found: $DOWNLOAD_SCRIPT" >&2
            exit 1
        fi

        # Try downloading (first without .gz, then with .gz if that fails)
        echo "Downloading from S3..." >&2
        TEMP_FILE="/tmp/pull_${FILENAME}_$$"

        if "$DOWNLOAD_SCRIPT" "$REGION" "$BUCKET" "" "" "" "$REMOTE_PATH" "$TEMP_FILE" 2>/dev/null; then
            mv "$TEMP_FILE" "$LOCAL_PATH"
            DOWNLOADED=true
            WAS_COMPRESSED=false
        elif "$DOWNLOAD_SCRIPT" "$REGION" "$BUCKET" "" "" "" "$COMPRESSED_REMOTE" "$TEMP_FILE" 2>/dev/null; then
            # File was compressed, decompress it
            gunzip -c "$TEMP_FILE" > "$LOCAL_PATH"
            rm -f "$TEMP_FILE"
            DOWNLOADED=true
            WAS_COMPRESSED=true
        else
            echo "Error: Failed to download file from S3" >&2
            echo "Tried: s3://${BUCKET}/${REMOTE_PATH}" >&2
            echo "Tried: s3://${BUCKET}/${COMPRESSED_REMOTE}" >&2
            rm -f "$TEMP_FILE"
            exit 1
        fi
        ;;

    r2)
        HANDLER_DIR="$PLUGIN_DIR/skills/handler-storage-r2"
        DOWNLOAD_SCRIPT="$HANDLER_DIR/scripts/download.sh"

        if [[ ! -f "$DOWNLOAD_SCRIPT" ]]; then
            echo "Error: R2 handler not found: $DOWNLOAD_SCRIPT" >&2
            exit 1
        fi

        # Try downloading
        echo "Downloading from R2..." >&2
        TEMP_FILE="/tmp/pull_${FILENAME}_$$"

        if "$DOWNLOAD_SCRIPT" "$REGION" "$BUCKET" "" "" "" "$REMOTE_PATH" "$TEMP_FILE" 2>/dev/null; then
            mv "$TEMP_FILE" "$LOCAL_PATH"
            DOWNLOADED=true
            WAS_COMPRESSED=false
        elif "$DOWNLOAD_SCRIPT" "$REGION" "$BUCKET" "" "" "" "$COMPRESSED_REMOTE" "$TEMP_FILE" 2>/dev/null; then
            gunzip -c "$TEMP_FILE" > "$LOCAL_PATH"
            rm -f "$TEMP_FILE"
            DOWNLOADED=true
            WAS_COMPRESSED=true
        else
            echo "Error: Failed to download file from R2" >&2
            rm -f "$TEMP_FILE"
            exit 1
        fi
        ;;

    gcs)
        HANDLER_DIR="$PLUGIN_DIR/skills/handler-storage-gcs"
        DOWNLOAD_SCRIPT="$HANDLER_DIR/scripts/download.sh"

        if [[ ! -f "$DOWNLOAD_SCRIPT" ]]; then
            echo "Error: GCS handler not found: $DOWNLOAD_SCRIPT" >&2
            exit 1
        fi

        # Try downloading
        echo "Downloading from GCS..." >&2
        PROJECT_ID=$(echo "$SOURCE_CONFIG" | jq -r '.project_id // ""')
        TEMP_FILE="/tmp/pull_${FILENAME}_$$"

        if "$DOWNLOAD_SCRIPT" "$PROJECT_ID" "$BUCKET" "$REMOTE_PATH" "$TEMP_FILE" 2>/dev/null; then
            mv "$TEMP_FILE" "$LOCAL_PATH"
            DOWNLOADED=true
            WAS_COMPRESSED=false
        elif "$DOWNLOAD_SCRIPT" "$PROJECT_ID" "$BUCKET" "$COMPRESSED_REMOTE" "$TEMP_FILE" 2>/dev/null; then
            gunzip -c "$TEMP_FILE" > "$LOCAL_PATH"
            rm -f "$TEMP_FILE"
            DOWNLOADED=true
            WAS_COMPRESSED=true
        else
            echo "Error: Failed to download file from GCS" >&2
            rm -f "$TEMP_FILE"
            exit 1
        fi
        ;;

    local)
        # Local "pull" is just a copy
        SOURCE_FILE="${BASE_PATH}/${FILENAME}"
        if [[ ! -f "$SOURCE_FILE" ]]; then
            echo "Error: File not found in local storage: $SOURCE_FILE" >&2
            exit 1
        fi
        cp "$SOURCE_FILE" "$LOCAL_PATH"
        DOWNLOADED=true
        WAS_COMPRESSED=false
        ;;

    *)
        echo "Error: Unsupported storage type: $TYPE" >&2
        exit 1
        ;;
esac

# Verify download
if [[ ! -f "$LOCAL_PATH" ]]; then
    echo "Error: Download completed but file not found: $LOCAL_PATH" >&2
    exit 1
fi

# Calculate final file info
SIZE=$(get_file_size "$LOCAL_PATH")
CHECKSUM=$(calculate_checksum "$LOCAL_PATH")
DOWNLOADED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "✓ Download successful: $LOCAL_PATH" >&2

# Return result
jq -n \
    --arg source "$SOURCE_NAME" \
    --arg local_path "$LOCAL_PATH" \
    --arg status "downloaded" \
    --arg size "$SIZE" \
    --arg checksum "sha256:$CHECKSUM" \
    --arg downloaded_at "$DOWNLOADED_AT" \
    --argjson was_compressed "$WAS_COMPRESSED" \
    '{
        source: $source,
        local_path: $local_path,
        status: $status,
        size_bytes: ($size | tonumber),
        checksum: $checksum,
        downloaded_at: $downloaded_at,
        was_compressed: $was_compressed
    }'
