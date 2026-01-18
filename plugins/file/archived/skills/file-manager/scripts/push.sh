#!/bin/bash
# File Plugin - Push Operation (SDK-backed)
# Uploads local file to cloud storage using the SDK
# Usage: push.sh <file_path> <source_name> [remote_path]

set -euo pipefail

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Parse arguments
FILE_PATH="${1:-}"
SOURCE_NAME="${2:-}"
REMOTE_PATH="${3:-}"

if [[ -z "$FILE_PATH" ]] || [[ -z "$SOURCE_NAME" ]]; then
    echo '{"success": false, "error": "Usage: push.sh <file_path> <source_name> [remote_path]"}' >&2
    exit 1
fi

# Check if file exists
if [[ ! -f "$FILE_PATH" ]]; then
    echo "{\"success\": false, \"error\": \"File not found: $FILE_PATH\"}" >&2
    exit 1
fi

# Default remote path to filename
if [[ -z "$REMOTE_PATH" ]]; then
    REMOTE_PATH="$(basename "$FILE_PATH")"
fi

# Use Node.js SDK wrapper
exec node "$SCRIPT_DIR/storage.mjs" upload "$SOURCE_NAME" "$FILE_PATH" "$REMOTE_PATH"
