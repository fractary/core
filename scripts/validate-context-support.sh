#!/bin/bash
#
# validate-context-support.sh
# Validates that all plugin commands and agents have proper --context support
#
# Usage: ./scripts/validate-context-support.sh
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGINS_DIR="${SCRIPT_DIR}/../plugins"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Counters
COMMANDS_TOTAL=0
COMMANDS_PASS=0
COMMANDS_FAIL=0
AGENTS_TOTAL=0
AGENTS_PASS=0
AGENTS_FAIL=0
DEPRECATED_FOUND=0

echo "============================================"
echo "  Context Argument Support Validation"
echo "============================================"
echo ""

# Check commands
echo "Checking commands for --context in argument-hint..."
echo "--------------------------------------------"

for plugin_dir in "${PLUGINS_DIR}"/*/; do
    plugin_name=$(basename "$plugin_dir")
    commands_dir="${plugin_dir}commands"

    if [[ -d "$commands_dir" ]]; then
        for cmd_file in "${commands_dir}"/*.md; do
            if [[ -f "$cmd_file" ]]; then
                COMMANDS_TOTAL=$((COMMANDS_TOTAL + 1))
                cmd_name=$(basename "$cmd_file" .md)

                # Check if argument-hint contains --context
                if grep -q 'argument-hint:.*--context' "$cmd_file"; then
                    COMMANDS_PASS=$((COMMANDS_PASS + 1))
                    echo -e "  ${GREEN}✓${NC} ${plugin_name}:${cmd_name}"
                else
                    COMMANDS_FAIL=$((COMMANDS_FAIL + 1))
                    echo -e "  ${RED}✗${NC} ${plugin_name}:${cmd_name} - missing --context in argument-hint"
                fi
            fi
        done
    fi
done

echo ""

# Check non-archived agents
echo "Checking agents for --context in ARGUMENTS section..."
echo "--------------------------------------------"

for plugin_dir in "${PLUGINS_DIR}"/*/; do
    plugin_name=$(basename "$plugin_dir")
    agents_dir="${plugin_dir}agents"

    if [[ -d "$agents_dir" ]]; then
        for agent_file in "${agents_dir}"/*.md; do
            if [[ -f "$agent_file" ]]; then
                AGENTS_TOTAL=$((AGENTS_TOTAL + 1))
                agent_name=$(basename "$agent_file" .md)

                # Check if file contains --context in ARGUMENTS section
                if grep -q '\-\-context.*Optional.*Additional instructions' "$agent_file"; then
                    AGENTS_PASS=$((AGENTS_PASS + 1))
                    echo -e "  ${GREEN}✓${NC} ${plugin_name}:${agent_name}"
                else
                    AGENTS_FAIL=$((AGENTS_FAIL + 1))
                    echo -e "  ${RED}✗${NC} ${plugin_name}:${agent_name} - missing --context in ARGUMENTS"
                fi
            fi
        done
    fi
done

echo ""

# Check for deprecated --prompt usage in non-archived files
echo "Checking for deprecated --prompt usage..."
echo "--------------------------------------------"

for plugin_dir in "${PLUGINS_DIR}"/*/; do
    plugin_name=$(basename "$plugin_dir")

    # Check commands (exclude archived)
    commands_dir="${plugin_dir}commands"
    if [[ -d "$commands_dir" ]]; then
        for cmd_file in "${commands_dir}"/*.md; do
            if [[ -f "$cmd_file" ]]; then
                # Check for --prompt in argument-hint (not in comments or examples)
                if grep -q 'argument-hint:.*--prompt' "$cmd_file"; then
                    DEPRECATED_FOUND=$((DEPRECATED_FOUND + 1))
                    echo -e "  ${YELLOW}!${NC} ${plugin_name}/commands/$(basename "$cmd_file") - still uses --prompt"
                fi
            fi
        done
    fi

    # Check agents (exclude archived)
    agents_dir="${plugin_dir}agents"
    if [[ -d "$agents_dir" ]]; then
        for agent_file in "${agents_dir}"/*.md; do
            if [[ -f "$agent_file" ]]; then
                # Check for --prompt in ARGUMENTS section
                if grep -q '\-\-prompt.*Additional\|prompt.*Optional.*Additional' "$agent_file"; then
                    DEPRECATED_FOUND=$((DEPRECATED_FOUND + 1))
                    echo -e "  ${YELLOW}!${NC} ${plugin_name}/agents/$(basename "$agent_file") - still uses --prompt"
                fi
            fi
        done
    fi
done

if [[ $DEPRECATED_FOUND -eq 0 ]]; then
    echo -e "  ${GREEN}✓${NC} No deprecated --prompt references found"
fi

echo ""
echo "============================================"
echo "  Summary"
echo "============================================"
echo ""
echo "Commands:"
echo -e "  Total:  $COMMANDS_TOTAL"
echo -e "  Pass:   ${GREEN}$COMMANDS_PASS${NC}"
echo -e "  Fail:   ${RED}$COMMANDS_FAIL${NC}"
echo ""
echo "Agents:"
echo -e "  Total:  $AGENTS_TOTAL"
echo -e "  Pass:   ${GREEN}$AGENTS_PASS${NC}"
echo -e "  Fail:   ${RED}$AGENTS_FAIL${NC}"
echo ""
echo "Deprecated --prompt:"
echo -e "  Found:  ${YELLOW}$DEPRECATED_FOUND${NC}"
echo ""

# Exit with error if any failures
if [[ $COMMANDS_FAIL -gt 0 ]] || [[ $AGENTS_FAIL -gt 0 ]] || [[ $DEPRECATED_FOUND -gt 0 ]]; then
    echo -e "${RED}Validation FAILED${NC}"
    exit 1
else
    echo -e "${GREEN}Validation PASSED${NC}"
    exit 0
fi
