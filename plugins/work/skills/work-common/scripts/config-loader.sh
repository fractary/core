#!/bin/bash
# Work Common: Configuration Loader
# Loads and validates work plugin configuration from .fractary/config.yaml
#
# This script delegates to the unified config loader in core/scripts/load-config.sh

set -euo pipefail

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Path to unified config loader (navigate up to plugins directory then to core)
CORE_LOADER="$SCRIPT_DIR/../../../../core/scripts/load-config.sh"

# Check if unified loader exists
if [ ! -f "$CORE_LOADER" ]; then
    echo "Error: Unified config loader not found at $CORE_LOADER" >&2
    exit 3
fi

# Delegate to unified config loader with 'work' section
# The unified loader automatically validates active_handler and handlers for 'work' section
exec "$CORE_LOADER" work active_handler handlers
