#!/usr/bin/env bash
#
# sync-index.sh - Sync archive index between local cache and cloud backup
#
# Usage: sync-index.sh <operation> <local_index_path> [cloud_index_path]
#
# Operations:
#   download: Sync from cloud to local (used by init/read)
#   upload: Sync from local to cloud (used after archival)
#   check: Check if cloud index exists
#
# Two-tier storage prevents index loss:
#   - Local cache: .fractary/plugins/spec/archive-index.json (fast, git-ignored)
#   - Cloud backup: archive/specs/.archive-index.json (durable, recoverable)

set -euo pipefail

OPERATION="${1:?Operation required: download|upload|check}"
LOCAL_INDEX="${2:?Local index path required}"
CLOUD_INDEX="${3:-}"

# Load file plugin configuration and S3 settings
load_s3_config() {
    FILE_CONFIG=".fractary/plugins/file/config.json"

    if [[ ! -f "$FILE_CONFIG" ]]; then
        return 1
    fi

    if ! command -v jq >/dev/null 2>&1; then
        echo "Error: jq not found" >&2
        return 1
    fi

    S3_REGION=$(jq -r '.handlers.s3.region // empty' "$FILE_CONFIG")
    S3_BUCKET=$(jq -r '.handlers.s3.bucket_name // empty' "$FILE_CONFIG")
    S3_AUTH_METHOD=$(jq -r '.handlers.s3.auth_method // "profile"' "$FILE_CONFIG")

    if [[ -z "$S3_REGION" ]] || [[ -z "$S3_BUCKET" ]]; then
        return 1
    fi

    # Extract credentials based on auth method
    S3_ACCESS_KEY=""
    S3_SECRET_KEY=""
    S3_ENDPOINT=""

    if [[ "$S3_AUTH_METHOD" == "profile" ]]; then
        S3_PROFILE=$(jq -r '.handlers.s3.profile // "default"' "$FILE_CONFIG")
        export AWS_PROFILE="$S3_PROFILE"
    elif [[ "$S3_AUTH_METHOD" == "keys" ]]; then
        S3_ACCESS_KEY=$(jq -r '.handlers.s3.access_key_id // ""' "$FILE_CONFIG")
        S3_SECRET_KEY=$(jq -r '.handlers.s3.secret_access_key // ""' "$FILE_CONFIG")
        S3_ACCESS_KEY=$(eval echo "$S3_ACCESS_KEY")
        S3_SECRET_KEY=$(eval echo "$S3_SECRET_KEY")
    fi

    S3_ENDPOINT=$(jq -r '.handlers.s3.endpoint // ""' "$FILE_CONFIG")

    return 0
}

# Helper: Check if fractary-file plugin available
has_fractary_file() {
    load_s3_config
}

# Helper: Download file from cloud (via fractary-file)
download_from_cloud() {
    local cloud_path="$1"
    local local_path="$2"

    if ! load_s3_config; then
        echo "fractary-file plugin not configured" >&2
        return 1
    fi

    local download_script="plugins/file/skills/handler-storage-s3/scripts/download.sh"
    if [[ ! -f "$download_script" ]]; then
        echo "S3 download script not found" >&2
        return 1
    fi

    # Call S3 download handler
    if ! "$download_script" "$S3_REGION" "$S3_BUCKET" "$S3_ACCESS_KEY" "$S3_SECRET_KEY" \
                           "$S3_ENDPOINT" "$cloud_path" "$local_path" 2>&1; then
        return 1
    fi

    return 0
}

# Helper: Upload file to cloud (via fractary-file)
upload_to_cloud() {
    local local_path="$1"
    local cloud_path="$2"

    if ! load_s3_config; then
        echo "fractary-file plugin not configured" >&2
        return 1
    fi

    local upload_script="plugins/file/skills/handler-storage-s3/scripts/upload.sh"
    if [[ ! -f "$upload_script" ]]; then
        echo "S3 upload script not found" >&2
        return 1
    fi

    # Call S3 upload handler
    if ! "$upload_script" "$S3_REGION" "$S3_BUCKET" "$S3_ACCESS_KEY" "$S3_SECRET_KEY" \
                          "$S3_ENDPOINT" "$local_path" "$cloud_path" "false" 2>&1; then
        return 1
    fi

    return 0
}

# Helper: Check if file exists in cloud
check_cloud_exists() {
    local cloud_path="$1"

    if ! load_s3_config; then
        return 1
    fi

    if ! command -v aws >/dev/null 2>&1; then
        return 1
    fi

    # Set credentials for AWS CLI
    if [[ -n "$S3_ACCESS_KEY" ]] && [[ -n "$S3_SECRET_KEY" ]]; then
        export AWS_ACCESS_KEY_ID="$S3_ACCESS_KEY"
        export AWS_SECRET_ACCESS_KEY="$S3_SECRET_KEY"
    fi
    export AWS_DEFAULT_REGION="$S3_REGION"

    # Build endpoint argument
    local endpoint_arg=""
    if [[ -n "$S3_ENDPOINT" ]]; then
        endpoint_arg="--endpoint-url $S3_ENDPOINT"
    fi

    # Check if file exists in S3
    if eval aws s3 ls "s3://${S3_BUCKET}/${cloud_path}" $endpoint_arg >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

case "$OPERATION" in
    download)
        # Sync from cloud to local (used on init, or when local missing)
        if [[ -z "$CLOUD_INDEX" ]]; then
            echo "Error: Cloud index path required for download" >&2
            exit 1
        fi

        echo "Syncing archive index from cloud..." >&2

        if download_from_cloud "$CLOUD_INDEX" "$LOCAL_INDEX"; then
            echo "✓ Archive index synced from cloud" >&2
            echo "✓ Local cache updated: $LOCAL_INDEX" >&2
            exit 0
        else
            # Cloud download failed or not available
            if [[ -f "$LOCAL_INDEX" ]]; then
                echo "⚠ Cloud sync unavailable, using existing local cache" >&2
                exit 0
            else
                echo "ℹ No cloud index found, creating new local index" >&2
                mkdir -p "$(dirname "$LOCAL_INDEX")"
                cat > "$LOCAL_INDEX" <<'EOF'
{
  "schema_version": "1.0",
  "last_updated": "",
  "last_synced": "",
  "archives": []
}
EOF
                exit 0
            fi
        fi
        ;;

    upload)
        # Sync from local to cloud (used after archival)
        if [[ -z "$CLOUD_INDEX" ]]; then
            echo "Error: Cloud index path required for upload" >&2
            exit 1
        fi

        if [[ ! -f "$LOCAL_INDEX" ]]; then
            echo "Error: Local index not found: $LOCAL_INDEX" >&2
            exit 1
        fi

        echo "Backing up archive index to cloud..." >&2

        # Update last_synced timestamp in local index
        CURRENT_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
        TEMP_INDEX=$(mktemp)
        jq --arg timestamp "$CURRENT_TIME" \
            '.last_synced = $timestamp' \
            "$LOCAL_INDEX" > "$TEMP_INDEX"
        mv "$TEMP_INDEX" "$LOCAL_INDEX"

        if upload_to_cloud "$LOCAL_INDEX" "$CLOUD_INDEX"; then
            echo "✓ Archive index backed up to cloud" >&2
            echo "✓ Cloud backup: $CLOUD_INDEX" >&2
            exit 0
        else
            echo "⚠ Cloud backup unavailable, index only in local cache" >&2
            echo "⚠ Local cache: $LOCAL_INDEX" >&2
            echo "⚠ Recommendation: Backup .fractary directory or implement cloud sync" >&2
            exit 0  # Non-critical, continue
        fi
        ;;

    check)
        # Check if cloud index exists
        if [[ -z "$CLOUD_INDEX" ]]; then
            echo "Error: Cloud index path required for check" >&2
            exit 1
        fi

        if check_cloud_exists "$CLOUD_INDEX"; then
            echo "✓ Cloud index exists: $CLOUD_INDEX" >&2
            exit 0
        else
            echo "ℹ No cloud index found (first archival will create it)" >&2
            exit 1
        fi
        ;;

    *)
        echo "Error: Unknown operation: $OPERATION" >&2
        echo "Usage: sync-index.sh <download|upload|check> <local_index> [cloud_index]" >&2
        exit 1
        ;;
esac
