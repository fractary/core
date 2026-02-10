#!/usr/bin/env bash
#
# migrate-local-archive.sh - Migrate locally archived specs/docs to cloud storage
#
# Thin wrapper around: fractary-core file migrate-archive
#
# Usage: migrate-local-archive.sh [--dry-run]
#
# All migration logic lives in the SDK (@fractary/core/file/migration.ts)
# and is exposed via the CLI (fractary-core file migrate-archive).

set -euo pipefail

DRY_RUN_FLAG=""
if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN_FLAG="--dry-run"
fi

exec fractary-core file migrate-archive \
    --local-dir ".fractary/specs/archive" \
    --cloud-prefix "archive/specs" \
    --source specs \
    --json \
    $DRY_RUN_FLAG
