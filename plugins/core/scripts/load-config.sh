#!/bin/bash
# Fractary Core: Unified Configuration Loader
# Loads and validates plugin configuration from .fractary/config.yaml
#
# Usage: load-config.sh <section> [validation_fields...]
#
# Arguments:
#   section             - Config section to extract (work, logs, spec, file, docs, repo)
#   validation_fields   - Optional fields to validate exist in the section
#
# Environment:
#   CLAUDE_WORK_CWD     - If set, use as project root (for Claude Code agents)
#
# Output: JSON representation of the config section
# Exit codes:
#   0 - Success
#   2 - Invalid arguments
#   3 - Configuration error (file not found, missing section, invalid YAML)

set -euo pipefail

# Check arguments
if [ $# -lt 1 ]; then
    echo "Usage: $0 <section> [validation_fields...]" >&2
    echo "  section: Config section to extract (work, logs, spec, file, docs, repo)" >&2
    exit 2
fi

SECTION="$1"
shift
VALIDATION_FIELDS=("$@")

# Validate section name
case "$SECTION" in
    work|logs|spec|file|docs|repo)
        ;;
    *)
        echo "Error: Invalid section '$SECTION'" >&2
        echo "  Valid sections: work, logs, spec, file, docs, repo" >&2
        exit 2
        ;;
esac

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

# Export PROJECT_ROOT for use by other scripts
export PROJECT_ROOT

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

# Build validation fields argument for Python
VALIDATION_ARGS=""
for field in "${VALIDATION_FIELDS[@]}"; do
    VALIDATION_ARGS="$VALIDATION_ARGS \"$field\""
done

# Extract and validate configuration using Python
# This script extracts the specified section from the unified YAML config
# and validates that required fields exist
python3 - "$CONFIG_FILE" "$SECTION" "${VALIDATION_FIELDS[@]}" <<'PYTHON_SCRIPT'
import sys
import yaml
import json
import os

config_file = sys.argv[1]
section = sys.argv[2]
validation_fields = sys.argv[3:] if len(sys.argv) > 3 else []

try:
    with open(config_file, 'r') as f:
        config = yaml.safe_load(f)

    if not isinstance(config, dict):
        print("Error: Configuration file must contain a YAML mapping", file=sys.stderr)
        sys.exit(3)

    if section not in config:
        print(f"Error: Missing '{section}' section in configuration", file=sys.stderr)
        print(f"  Config file: {config_file}", file=sys.stderr)
        sys.exit(3)

    section_config = config[section]

    if not isinstance(section_config, dict):
        print(f"Error: '{section}' section must be a mapping", file=sys.stderr)
        sys.exit(3)

    # Validate required fields if specified
    for field in validation_fields:
        # Support nested fields like "handlers.github"
        parts = field.split('.')
        current = section_config
        for part in parts:
            if not isinstance(current, dict) or part not in current:
                print(f"Error: Missing required field: {section}.{field}", file=sys.stderr)
                sys.exit(3)
            current = current[part]

    # Special validation for handler-based configs (work, repo, file)
    if section in ['work', 'repo', 'file']:
        if 'active_handler' in section_config:
            active_handler = section_config['active_handler']
            handlers = section_config.get('handlers', {})
            if active_handler not in handlers:
                print(f"Error: Configuration for handler '{active_handler}' not found", file=sys.stderr)
                print(f"  Active handler set to: {active_handler}", file=sys.stderr)
                print(f"  But {section}.handlers.{active_handler} is missing", file=sys.stderr)
                sys.exit(3)

    # Output section config as JSON for shell consumption
    print(json.dumps(section_config, indent=2))

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
