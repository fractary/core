#!/usr/bin/env bash
# Fractary WorktreeCreate Hook
#
# Replaces Claude Code's default git worktree creation to:
#   1. Place worktrees under a configurable location (default: .claude/worktrees/)
#   2. Copy gitignored .fractary/env/.env* files so credentials are available
#   3. Copy root .env* files (legacy location support)
#
# Stdin JSON: {"hook_event_name":"WorktreeCreate","cwd":"/path","name":"worktree-name"}
# Stdout: absolute path to the created worktree
#
# Reads worktree location from .fractary/config.yaml repo.worktree.location
# Falls back to .claude/worktrees if config is unavailable.

set -euo pipefail

# --- Parse stdin JSON ---
INPUT=$(cat)
CWD=$(echo "$INPUT" | jq -r '.cwd')
NAME=$(echo "$INPUT" | jq -r '.name')

if [ -z "$CWD" ] || [ "$CWD" = "null" ] || [ -z "$NAME" ] || [ "$NAME" = "null" ]; then
  echo "Error: Missing required fields (cwd, name) in stdin JSON" >&2
  exit 2
fi

# --- Log hook invocation for debugging ---
HOOK_LOG="$CWD/.claude/worktree-create.log"
mkdir -p "$(dirname "$HOOK_LOG")" 2>/dev/null || true
echo "$(date -u '+%Y-%m-%dT%H:%M:%SZ') [WorktreeCreate] name=$NAME cwd=$CWD" \
  >> "$HOOK_LOG" 2>/dev/null || true
echo "WorktreeCreate hook running: name=$NAME" >&2

# --- Resolve git repo root ---
REPO_ROOT=$(git -C "$CWD" rev-parse --show-toplevel 2>/dev/null || echo "$CWD")

# --- Read worktree location from config ---
WORKTREE_BASE=""
CONFIG_FILE="$REPO_ROOT/.fractary/config.yaml"
if [ -f "$CONFIG_FILE" ]; then
  # Extract repo.worktree.location from YAML using grep/awk
  # Look for 'worktree:' under repo section, then 'location:' under that
  WORKTREE_BASE=$(grep -A2 'worktree:' "$CONFIG_FILE" 2>/dev/null \
    | grep 'location:' \
    | head -1 \
    | sed 's/^[[:space:]]*location:[[:space:]]*//' \
    | sed 's/[[:space:]]*$//' \
    | sed "s/^['\"]//;s/['\"]$//" \
  ) || true
fi
WORKTREE_BASE="${WORKTREE_BASE:-.claude/worktrees}"
# Expand ~ if present (grep/sed output is not shell-expanded)
WORKTREE_BASE="${WORKTREE_BASE/#\~/$HOME}"

# Resolve to absolute path
if [[ "$WORKTREE_BASE" != /* ]]; then
  WORKTREE_BASE="$REPO_ROOT/$WORKTREE_BASE"
fi

WORKTREE_PATH="$WORKTREE_BASE/$NAME"

# --- Create the worktree ---
if [ -d "$WORKTREE_PATH" ]; then
  echo "Worktree path already exists at $WORKTREE_PATH (may have been pre-created)" >&2
else
  mkdir -p "$WORKTREE_BASE"
  # Create a new detached worktree from HEAD
  # Claude Code manages branch creation within the session
  git -C "$REPO_ROOT" worktree add --detach "$WORKTREE_PATH" HEAD 2>&1 >&2
fi

# --- Copy .fractary/env files (standard location) ---
FRACTARY_ENV_DIR="$REPO_ROOT/.fractary/env"
if [ -d "$FRACTARY_ENV_DIR" ]; then
  DEST_ENV_DIR="$WORKTREE_PATH/.fractary/env"
  mkdir -p "$DEST_ENV_DIR" || echo "Warning: failed to create $DEST_ENV_DIR" >&2
  for f in "$FRACTARY_ENV_DIR"/.env*; do
    [ -f "$f" ] || continue
    # Skip .env.example - it's tracked by git and already in the worktree
    [[ "$(basename "$f")" == ".env.example" ]] && continue
    if cp -f "$f" "$DEST_ENV_DIR/"; then
      echo "Copied $(basename "$f") to worktree" >&2
    else
      echo "Warning: failed to copy $(basename "$f")" >&2
    fi
  done
else
  echo "No .fractary/env/ directory found at $REPO_ROOT — skipping credential copy" >&2
fi

# --- Copy root .env files (legacy location) ---
for f in "$REPO_ROOT"/.env*; do
  [ -f "$f" ] || continue
  [[ "$(basename "$f")" == ".env.example" ]] && continue
  cp -f "$f" "$WORKTREE_PATH/" 2>/dev/null \
    && echo "Copied root $(basename "$f") to worktree" >&2 \
    || true
done

# --- Return the worktree path ---
echo "$WORKTREE_PATH"
