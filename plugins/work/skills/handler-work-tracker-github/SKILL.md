---
name: handler-work-tracker-github
description: "[DEPRECATED] GitHub Issues handler - Use Fractary Core CLI instead"
model: haiku
handler_type: work-tracker
platform: github
deprecated: true
---

# GitHub Work Tracker Handler

> **⚠️ DEPRECATED**: This handler is deprecated. Skills now use Fractary Core CLI (`fractary-core work <command>`) directly instead of platform-specific handlers.
>
> **Migration**: See `specs/WORK-00356-implement-faber-cli-work-commands.md` for the CLI migration plan.

<CONTEXT>
You are the GitHub Issues handler for the work plugin. This handler is **DEPRECATED** as of the CLI migration.

**New approach**: Skills invoke `fractary-core work <command> --json` directly instead of routing through platform-specific handlers.

**Why deprecated**:
1. CLI provides platform abstraction at a lower level
2. Reduces context by eliminating handler layer
3. Simplifies skill implementations
4. Centralized maintenance in CLI codebase
</CONTEXT>

<CRITICAL_RULES>
1. **DEPRECATED** - Do not use this handler for new implementations
2. Skills should use Fractary Core CLI directly: `fractary-core work <command> --json`
3. Existing scripts retained for backward compatibility only
4. No new features will be added to this handler
</CRITICAL_RULES>

## Migration Guide

### Before (Handler-based)
```
Skill → Handler → scripts/*.sh → GitHub API
```

### After (CLI-based)
```
Skill → Fractary Core CLI → GitHub API
```

### Example Migration

**Before (deprecated):**
```bash
# Skill invokes handler script
./scripts/fetch-issue.sh 123
```

**After (recommended):**
```bash
# Skill invokes CLI directly
fractary-core work issue fetch 123 --json
```

## CLI Command Mapping

| Handler Operation | CLI Command | Status |
|-------------------|-------------|--------|
| fetch-issue | `fractary-core work issue fetch <n>` | ✅ Available |
| create-issue | `fractary-core work issue create` | ✅ Available |
| update-issue | `fractary-core work issue update <n>` | ✅ Available |
| close-issue | `fractary-core work issue close <n>` | ✅ Available |
| reopen-issue | `fractary-core work issue reopen <n>` | ❌ Missing |
| list-issues | `fractary-core work issue search` | ✅ Available |
| create-comment | `fractary-core work comment create <n>` | ✅ Available |
| list-comments | `fractary-core work comment list <n>` | ✅ Available |
| add-label | `fractary-core work label add <n>` | ✅ Available |
| remove-label | `fractary-core work label remove <n>` | ✅ Available |
| assign-issue | `fractary-core work issue assign <n>` | ❌ Missing |
| classify-issue | `fractary-core work issue classify <n>` | ❌ Missing |

## Backward Compatibility

Existing scripts in `scripts/` are retained for:
- Backward compatibility with old skill versions
- Reference implementations for CLI development
- Testing and validation

Scripts will be removed in a future major version once CLI migration is complete.

## Dependencies (for legacy scripts)

### Required Tools
- `gh` CLI (GitHub CLI) - https://cli.github.com
- `jq` - JSON processor
- `bash` 4.0+

### Environment Variables
- `GITHUB_TOKEN` - GitHub personal access token

## Script Locations (Legacy)

```
handler-work-tracker-github/
├── SKILL.md (this file)
├── scripts/                    # DEPRECATED - for backward compatibility only
│   ├── fetch-issue.sh
│   ├── classify-issue.sh
│   ├── create-comment.sh
│   ├── add-label.sh
│   ├── remove-label.sh
│   ├── close-issue.sh
│   ├── reopen-issue.sh
│   ├── update-state.sh
│   ├── list-issues.sh
│   └── ...
└── docs/
    └── github-api.md
```

## See Also

- `specs/WORK-00356-implement-faber-cli-work-commands.md` - CLI migration spec
- `specs/WORK-00356-1-missing-cli-work-commands.md` - Missing CLI commands
- `plugins/work/skills/cli-helper/SKILL.md` - CLI invocation patterns
