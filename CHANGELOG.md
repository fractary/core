# Changelog

All notable changes to Fractary Core will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2026-01-08

### Added

#### fractary-work Plugin (v2.3.0)

- **Bulk Issue Creation**: New `issue-create-bulk` command for creating multiple related issues at once
  - AI-powered discovery of datasets, API endpoints, templates from project structure
  - Intelligent issue creation based on conversation context
  - Mandatory confirmation before creating any issues
  - Support for GitHub issue templates (if project has them)
  - Automatic duplicate detection (last 100 open issues)
  - Project intelligence for ETL, API, and content projects
  - Safety-first design with AskUserQuestion confirmation

- **New Agent**: `issue-bulk-creator`
  - 4-step workflow: Analyze → Plan → Confirm → Create
  - Pattern recognition for datasets, API endpoints, templates
  - Direct GitHub CLI integration (gh issue create/edit)
  - Comprehensive error handling with recovery guidance

- **New Command**: `issue-create-bulk`
  - Arguments: `--prompt`, `--type`, `--label`, `--template`, `--assignee`
  - Type parameter adds labels (e.g., `--type feature` → "feature" label)
  - Template support for projects with `.github/ISSUE_TEMPLATE/`

- **Documentation**:
  - User guide with examples and troubleshooting
  - Test plan with 14 comprehensive scenarios
  - Specification: `SPEC-20260108-bulk-issue-creation.md`

### Changed

#### fractary-work Plugin

- Updated marketplace description to mention bulk creation and refinement capabilities
- Added keywords: `bulk-creation`, `automation`

### Security

- Added security note about filesystem access requirements for project discovery
- Agent requires `Read(*)`, `Glob(*)`, `Grep(*)` for intelligent issue creation
- Users should only use in trusted repositories

## [2.0.0] - 2026-01-05

### 🚨 BREAKING CHANGES

This is a major release with **breaking changes** that require all projects to re-initialize their configuration.

#### Unified YAML Configuration

The most significant change in v2.0 is the introduction of a **unified YAML configuration system** that replaces the fragmented per-plugin JSON configs.

**Before (v1.x):**
- Multiple config files: `.fractary/plugins/{name}/config.json`
- JSON format
- Per-plugin initialization commands

**After (v2.0):**
- Single config file: `.fractary/core/config.yaml`
- YAML format only (JSON no longer supported)
- Unified init command: `fractary-core:init`
- Handler pattern for multi-platform support
- Environment variable substitution: `${VAR_NAME}` and `${VAR_NAME:-default}`

#### Migration Required

All existing projects must be re-initialized:

```bash
# Backup existing config
tar czf fractary-backup.tar.gz .fractary/

# Re-initialize with unified config
fractary-core:init
```

See the [Migration Guide](docs/guides/configuration.md#migration-guide) for detailed instructions.

### Added

#### Core Infrastructure
- **Unified YAML Config Loaders**
  - TypeScript: `@fractary/core/common/yaml-config`
  - Python: `fractary_core.common.yaml_config`
  - Environment variable substitution at runtime
  - Project root auto-detection
  - Config validation utilities

- **Config Validation Commands**
  - `fractary-core config validate` - Validate `.fractary/core/config.yaml`
  - `fractary-core config show` - Display config with secrets redacted
  - Comprehensive validation with error/warning reporting

- **Unified Init Agent**
  - `fractary-core:init` - Initialize all plugins in one command
  - Auto-detect platforms from git remotes
  - Support for multiple platforms per plugin
  - Arguments: `--plugins`, `--work-platform`, `--repo-platform`, `--file-handler`, `--yes`, `--force`

#### Configuration Features
- **Handler Pattern**: Configure multiple platforms per plugin, switch via `active_handler`
  - Example: Configure both GitHub and Jira for work tracking, switch between them
- **Environment Variable Substitution**:
  - `${VAR_NAME}` - Required variable
  - `${VAR_NAME:-default}` - With fallback default
- **Config Validation**: Automatic validation on load with detailed error messages
- **Comprehensive Example**: `.fractary/core/config.example.yaml` with 700+ lines documenting all options

#### Documentation
- Complete **Configuration Guide** with v2.0 examples
- **Migration Guide** with step-by-step instructions
- Breaking changes documentation
- Platform-specific configuration examples

### Changed

#### Configuration Location
- **Old**: `.fractary/plugins/{name}/config.json` (per plugin)
- **New**: `.fractary/core/config.yaml` (unified)

⚠️ **Important**: Config is at `.fractary/core/config.yaml` (inside `core/` directory), NOT `.fractary/core.yaml`

#### Configuration Format
- **Old**: JSON with flat structure
- **New**: YAML with handler pattern

```yaml
# Old (v1.x)
{
  "platform": "github",
  "token": "ghp_..."
}

# New (v2.0)
work:
  active_handler: github
  handlers:
    github:
      token: ${GITHUB_TOKEN}
```

#### Init Commands
Individual plugin init commands are now **deprecated** and delegate to unified init:

- `fractary-work:init` → Use `fractary-core:init --plugins work`
- `fractary-repo:init` → Use `fractary-core:init --plugins repo`
- `fractary-logs:init` → Use `fractary-core:init --plugins logs`
- `fractary-file:init` → Use `fractary-core:init --plugins file`
- `fractary-spec:init` → Use `fractary-core:init --plugins spec`

These commands still work but show deprecation warnings and delegate to the unified init.

#### SDK Config Loaders
- All SDK config loaders now load from `.fractary/core/config.yaml`
- Environment variable substitution happens at load time
- Config validation integrated into load process

#### MCP Server
- MCP server now loads from `.fractary/core/config.yaml`
- Supports both project and user-level configs
- Priority: project config > user config > environment variables

### Removed

#### No Backward Compatibility
- **Removed**: JSON config support (`.fractary/core.json`, `.fractary/plugins/{name}/config.json`)
- **Removed**: Automatic migration from v1.x
- **Removed**: Individual plugin config directories

These removals are intentional to enforce the unified configuration standard.

### Dependencies

#### Added
- `js-yaml@^4.1.1` - YAML parsing for TypeScript/JavaScript
- `@types/js-yaml@^4.0.9` - TypeScript definitions
- `pyyaml` - YAML parsing for Python (already present)

### Files Modified

#### Core Infrastructure
- `sdk/js/src/common/yaml-config.ts` - **NEW** - Unified YAML loader (TS)
- `sdk/py/fractary_core/common/yaml_config.py` - **NEW** - Unified YAML loader (Python)
- `sdk/js/src/common/config.ts` - Updated to use unified YAML
- `sdk/py/fractary_core/work/manager.py` - Load from unified YAML
- `sdk/py/fractary_core/repo/manager.py` - Load from unified YAML

#### CLI
- `cli/src/utils/config.ts` - Complete rewrite for YAML
- `cli/src/commands/config.ts` - **NEW** - Config validation commands
- `cli/src/cli.ts` - Register config command
- `cli/package.json` - Add js-yaml dependency

#### MCP Server
- `mcp/server/src/config.ts` - Updated for YAML
- `mcp/server/package.json` - Add js-yaml dependency

#### Plugins
- `plugins/core/agents/init.md` - **NEW** - Unified init agent
- `plugins/work/agents/init.md` - Add deprecation notice
- `plugins/repo/agents/init.md` - Add deprecation notice
- `plugins/spec/agents/spec-init.md` - Add deprecation notice
- `plugins/logs/agents/logs-init.md` - Add deprecation notice
- `plugins/file/agents/file-init.md` - Add deprecation notice
- `plugins/work/skills/work-common/scripts/config-loader.sh` - Use Python for YAML

#### Configuration
- `.fractary/core/config.example.yaml` - **NEW** - Comprehensive example (700+ lines)

#### Documentation
- `docs/guides/configuration.md` - Complete rewrite for v2.0
- `CHANGELOG.md` - **NEW** - This file
- `specs/SPEC-20260105-unified-yaml-config-migration.md` - **NEW** - Migration spec

### Migration Checklist

For projects upgrading from v1.x:

- [ ] Backup existing config: `tar czf fractary-backup.tar.gz .fractary/`
- [ ] Update to v2.0: `npm install @fractary/core@2.0.0`
- [ ] Run unified init: `fractary-core:init`
- [ ] Manually merge custom settings from old config
- [ ] Validate new config: `fractary-core config validate`
- [ ] Test all plugins work correctly
- [ ] Remove old config backup: `rm -rf .fractary.v1`

### Known Issues

None at this time.

### Security

- Tokens and secrets are now referenced via environment variables using `${VAR_NAME}` syntax
- Config validation warns about missing environment variables
- `config show` command automatically redacts sensitive values

### Performance

- Config loading is now faster due to single file read vs multiple files
- Environment variable substitution happens once at load time
- Config validation is lazy (only when explicitly requested)

### Compatibility

- **Node.js**: >= 16.0.0
- **Python**: >= 3.8
- **Breaking**: v2.0 is NOT compatible with v1.x configs

---

## [1.x] - Previous Versions

For v1.x changelog, see git history. v1.x used the old JSON-based per-plugin configuration system.

---

## Future Releases

### Planned for v2.1
- Config encryption for sensitive values
- Multi-environment config profiles
- Config import/export utilities
- Automatic config migration from v1.x

### Under Consideration
- GUI config editor
- Config templates for common setups
- Config inheritance/extends
- Remote config loading (HTTP/S3)
