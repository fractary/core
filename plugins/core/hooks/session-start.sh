#!/usr/bin/env bash
# Fractary SessionStart Hook
#
# Writes .fractary/env/.env-active with a default environment name
# when no environment is currently selected.
#
# Default env is read from .fractary/config.yaml core.defaultEnv,
# falling back to "test".
#
# Stdin JSON: {"hook_event_name":"SessionStart","cwd":"/path"}
# Stdout: status message

set -euo pipefail

INPUT=$(cat)
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')
[ -z "$CWD" ] && CWD="$(pwd)"

ENV_DIR="$CWD/.fractary/env"
ENV_ACTIVE="$ENV_DIR/.env-active"

# Skip if .fractary/env/ doesn't exist (not a Fractary env project)
[ -d "$ENV_DIR" ] || exit 0

# Skip if an env is already selected
[ -f "$ENV_ACTIVE" ] && exit 0

# Read defaultEnv from config (core.defaultEnv), fallback to "test"
CONFIG_FILE="$CWD/.fractary/config.yaml"
DEFAULT_ENV="test"
if [ -f "$CONFIG_FILE" ]; then
  CONFIGURED=$(grep -A5 '^core:' "$CONFIG_FILE" 2>/dev/null \
    | grep 'defaultEnv:' | head -1 \
    | sed 's/^[[:space:]]*defaultEnv:[[:space:]]*//' \
    | sed 's/[[:space:]]*$//' \
    | sed "s/^['\"]//;s/['\"]$//") || true
  [ -n "$CONFIGURED" ] && DEFAULT_ENV="$CONFIGURED"
fi

# Validate env name (alphanumeric, dash, underscore)
if ! echo "$DEFAULT_ENV" | grep -qE '^[a-zA-Z0-9_-]+$'; then
  echo "fractary: SessionStart hook: invalid defaultEnv name '$DEFAULT_ENV', skipping" >&2
  exit 0
fi

# Only activate if the env file actually exists
ENV_FILE="$ENV_DIR/.env.$DEFAULT_ENV"
if [ ! -f "$ENV_FILE" ]; then
  echo "fractary: SessionStart hook: .env.$DEFAULT_ENV not found, skipping auto-activation" >&2
  exit 0
fi

echo "$DEFAULT_ENV" > "$ENV_ACTIVE"
echo "fractary: activated default environment '$DEFAULT_ENV'"
