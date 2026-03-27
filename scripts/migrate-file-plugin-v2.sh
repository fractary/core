#!/bin/bash
# Migration Script: File Plugin v1.0 → v2.0
# Migrates existing projects to new file plugin sources architecture
#
# Usage: ./scripts/migrate-file-plugin-v2.sh [--dry-run]

set -euo pipefail

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=true
    echo "🔍 DRY RUN MODE - No changes will be made"
    echo ""
fi

echo "========================================="
echo "File Plugin v2.0 Migration"
echo "========================================="
echo ""

# Check if we're in a fractary project
if [[ ! -d ".fractary" ]]; then
    echo "❌ Error: Not in a fractary project (no .fractary directory found)"
    exit 1
fi

echo "Step 1: Config File Migration"
echo "------------------------------"

# Check current config location
if [[ -f ".fractary/core/config.yaml" ]] && [[ ! -f ".fractary/config.yaml" ]]; then
    echo "✓ Found config at old location: .fractary/core/config.yaml"
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "  [DRY-RUN] Would move to: .fractary/config.yaml"
    else
        mv .fractary/core/config.yaml .fractary/config.yaml
        echo "  ✓ Moved to: .fractary/config.yaml"
    fi
elif [[ -f ".fractary/config.yaml" ]]; then
    echo "✓ Config already at new location: .fractary/config.yaml"
else
    echo "⚠️  No config file found"
fi

echo ""
echo "Step 2: Directory Structure"
echo "------------------------------"

# Create new directories
if [[ ! -d ".fractary/logs" ]]; then
    echo "Creating .fractary/logs/"
    if [[ "$DRY_RUN" == "false" ]]; then
        mkdir -p .fractary/logs
    fi
else
    echo "✓ .fractary/logs/ already exists"
fi

if [[ ! -d ".fractary/specs" ]]; then
    echo "Creating .fractary/specs/"
    if [[ "$DRY_RUN" == "false" ]]; then
        mkdir -p .fractary/specs
    fi
else
    echo "✓ .fractary/specs/ already exists"
fi

echo ""
echo "Step 3: Archive Index Migration"
echo "------------------------------"

# Migrate logs archive index
if [[ -f ".fractary/plugins/logs/archive-index.json" ]] && [[ ! -f ".fractary/logs/archive-index.json" ]]; then
    echo "✓ Found logs archive index at old location"
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "  [DRY-RUN] Would move to: .fractary/logs/archive-index.json"
    else
        mv .fractary/plugins/logs/archive-index.json .fractary/logs/
        echo "  ✓ Moved to: .fractary/logs/archive-index.json"
    fi
elif [[ -f ".fractary/logs/archive-index.json" ]]; then
    echo "✓ Logs archive index already at new location"
else
    echo "⚠️  No logs archive index found (will be created on first use)"
fi

# Migrate specs archive index
if [[ -f ".fractary/plugins/spec/archive-index.json" ]] && [[ ! -f ".fractary/specs/archive-index.json" ]]; then
    echo "✓ Found specs archive index at old location"
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "  [DRY-RUN] Would move to: .fractary/specs/archive-index.json"
    else
        mv .fractary/plugins/spec/archive-index.json .fractary/specs/
        echo "  ✓ Moved to: .fractary/specs/archive-index.json"
    fi
elif [[ -f ".fractary/specs/archive-index.json" ]]; then
    echo "✓ Specs archive index already at new location"
else
    echo "⚠️  No specs archive index found (will be created on first use)"
fi

echo ""
echo "Step 4: .gitignore Update"
echo "------------------------------"

if [[ -f ".gitignore" ]]; then
    # Check if new paths are already in .gitignore
    if grep -q "\.fractary/logs/\*\.log" .gitignore 2>/dev/null; then
        echo "✓ .gitignore already contains new paths"
    else
        echo "Adding new paths to .gitignore"
        if [[ "$DRY_RUN" == "false" ]]; then
            cat >> .gitignore << 'EOF'

# Fractary v2.0 paths
.fractary/logs/*.log
.fractary/logs/*.log.gz
.fractary/specs/*.md
.fractary/codex/cache/
EOF
            echo "  ✓ Updated .gitignore"
        else
            echo "  [DRY-RUN] Would add new paths to .gitignore"
        fi
    fi
else
    echo "⚠️  No .gitignore found (consider creating one)"
fi

echo ""
echo "Step 5: Configuration Check"
echo "------------------------------"

if [[ -f ".fractary/config.yaml" ]]; then
    # Check schema version
    if command -v python3 >/dev/null 2>&1; then
        SCHEMA_VERSION=$(python3 -c "import yaml; print(yaml.safe_load(open('.fractary/config.yaml'))['file'].get('schema_version', '1.0'))" 2>/dev/null || echo "unknown")

        if [[ "$SCHEMA_VERSION" == "2.0" ]]; then
            echo "✓ File plugin schema version: 2.0"
        elif [[ "$SCHEMA_VERSION" == "1.0" ]]; then
            echo "⚠️  File plugin still at schema version 1.0"
            echo "   Manual update required to sources-based configuration"
            echo "   See: specs/SPEC-file-plugin-sources-architecture.md"
        else
            echo "⚠️  Could not determine schema version"
        fi
    else
        echo "⚠️  Python3 not found - cannot check schema version"
    fi

    # Check if paths are updated
    if grep -q "local_path: \.fractary/logs" .fractary/config.yaml 2>/dev/null; then
        echo "✓ Logs plugin using new path (.fractary/logs)"
    else
        echo "⚠️  Logs plugin path may need updating"
    fi

    if grep -q "local_path: \.fractary/specs" .fractary/config.yaml 2>/dev/null; then
        echo "✓ Specs plugin using new path (.fractary/specs)"
    else
        echo "⚠️  Specs plugin path may need updating"
    fi
else
    echo "⚠️  No config file found"
fi

echo ""
echo "========================================="
if [[ "$DRY_RUN" == "true" ]]; then
    echo "DRY RUN COMPLETE"
    echo "Run without --dry-run to apply changes"
else
    echo "MIGRATION COMPLETE"
    echo ""
    echo "Next steps:"
    echo "1. Review .fractary/config.yaml for schema version 2.0"
    echo "2. Test: bash plugins/file/skills/fractary-file-file-manager/scripts/push.sh <file> <source>"
    echo "3. Commit changes to git"
fi
echo "========================================="
