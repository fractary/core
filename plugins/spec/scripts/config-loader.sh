#!/bin/bash
# Spec Plugin: Configuration Loader
# Loads and validates spec plugin configuration from .fractary/config.yaml

set -euo pipefail

# Find project root by locating .git or .fractary directory
# This ensures we can find config regardless of current working directory
#
# CRITICAL FIX: Check for CLAUDE_WORK_CWD environment variable first
# This solves the agent execution context bug where agents run from plugin directory
# instead of user's project directory.
if [ -n "${CLAUDE_WORK_CWD:-}" ]; then
    # Use working directory provided by command layer
    PROJECT_ROOT="$CLAUDE_WORK_CWD"
elif command -v git >/dev/null 2>&1; then
    # Fallback: Use git to find repository root
    PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
else
    # Fallback: Try to find .fractary directory in parent directories
    PROJECT_ROOT="$(pwd)"
    while [ "$PROJECT_ROOT" != "/" ]; do
        if [ -d "$PROJECT_ROOT/.fractary" ] || [ -d "$PROJECT_ROOT/.git" ]; then
            break
        fi
        PROJECT_ROOT="$(dirname "$PROJECT_ROOT")"
    done
    # If we reached root without finding markers, use current directory
    if [ "$PROJECT_ROOT" = "/" ]; then
        PROJECT_ROOT="$(pwd)"
    fi
fi

# Configuration file location (unified YAML config)
# Try new location first, fallback to legacy location
CONFIG_FILE="$PROJECT_ROOT/.fractary/config.yaml"
if [ ! -f "$CONFIG_FILE" ]; then
    CONFIG_FILE="$PROJECT_ROOT/.fractary/core/config.yaml"
fi

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: Configuration file not found" >&2
    echo "  Tried: $PROJECT_ROOT/.fractary/config.yaml" >&2
    echo "  Tried: $PROJECT_ROOT/.fractary/core/config.yaml" >&2
    echo "  Run: fractary-core:configure" >&2
    exit 3
fi

# Extract and validate spec configuration using Python
# This script extracts the 'spec' section from the unified YAML config
# and validates that required fields exist
python3 - "$CONFIG_FILE" <<'PYTHON_SCRIPT'
import sys
import yaml
import json

config_file = sys.argv[1]

try:
    with open(config_file, 'r') as f:
        config = yaml.safe_load(f)

    if not isinstance(config, dict):
        print("Error: Configuration file must contain a YAML mapping", file=sys.stderr)
        sys.exit(3)

    if 'spec' not in config:
        print("Error: Missing 'spec' section in configuration", file=sys.stderr)
        print(f"  Config file: {config_file}", file=sys.stderr)
        sys.exit(3)

    spec_config = config['spec']

    if not isinstance(spec_config, dict):
        print("Error: 'spec' section must be a mapping", file=sys.stderr)
        sys.exit(3)

    # Validate required fields
    if 'storage' not in spec_config:
        print("Error: Missing required field: spec.storage", file=sys.stderr)
        sys.exit(3)

    # Output spec config as JSON for shell consumption
    print(json.dumps(spec_config, indent=2))

except FileNotFoundError:
    print(f"Error: Configuration file not found: {config_file}", file=sys.stderr)
    sys.exit(3)
except yaml.YAMLError as e:
    print(f"Error: Invalid YAML in configuration file: {e}", file=sys.stderr)
    sys.exit(3)
except Exception as e:
    print(f"Error: Failed to load configuration: {e}", file=sys.stderr)
    sys.exit(3)
PYTHON_SCRIPT
