#!/bin/bash
# Logs Plugin: Configuration Loader
# Loads and validates logs plugin configuration from .fractary/config.yaml
#
# This script delegates to the unified config loader in core/scripts/load-config.sh

set -euo pipefail

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Path to unified config loader
CORE_LOADER="$SCRIPT_DIR/../../core/scripts/load-config.sh"

# Check if unified loader exists
if [ ! -f "$CORE_LOADER" ]; then
    echo "Error: Unified config loader not found at $CORE_LOADER" >&2
    exit 3
fi

# Delegate to unified config loader with 'logs' section
# Validate 'storage' field exists
exec "$CORE_LOADER" logs storage
