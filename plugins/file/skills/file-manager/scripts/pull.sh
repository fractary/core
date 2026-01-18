#!/bin/bash
# File Plugin - Pull Operation (SDK-backed)
# Downloads file from cloud storage using the SDK
# Usage: pull.sh <source_name> <remote_path> <local_path>

set -euo pipefail

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Parse arguments
SOURCE_NAME="${1:-}"
REMOTE_PATH="${2:-}"
LOCAL_PATH="${3:-}"

if [[ -z "$SOURCE_NAME" ]] || [[ -z "$REMOTE_PATH" ]] || [[ -z "$LOCAL_PATH" ]]; then
    echo '{"success": false, "error": "Usage: pull.sh <source_name> <remote_path> <local_path>"}' >&2
    exit 1
fi

# Use Node.js SDK wrapper
exec node "$SCRIPT_DIR/storage.mjs" download "$SOURCE_NAME" "$REMOTE_PATH" "$LOCAL_PATH"
