# v2.0 Documentation Update Status

## ✅ Completed Documentation Updates

### Core Documentation
- ✅ **README.md** - Updated MCP config path to `.fractary/core/config.yaml`
- ✅ **CHANGELOG.md** - Created with comprehensive v2.0 breaking changes
- ✅ **docs/guides/configuration.md** - Complete rewrite for v2.0:
  - Added v2.0 overview and "What's New" section
  - Added Quick Start guide
  - Added Configuration Structure section
  - Added comprehensive Migration Guide
  - Updated all config path references
  - Fixed environment variable examples
- ✅ **docs/guides/integration.md** - Updated:
  - Fixed config path references
  - Updated plugin configuration examples to v2.0 format
- ✅ **.fractary/core/config.example.yaml** - Created comprehensive 700+ line example
- ✅ **specs/SPEC-20260105-unified-yaml-config-migration.md** - Created migration spec

## ⚠️ Plugin READMEs Need Updates

The following plugin README files still contain v1.x configuration examples and need to be updated to reference the unified config at `.fractary/core/config.yaml`:

### plugins/work/README.md
**Lines needing updates:**
- Line 136-173: Configuration section shows old `.fractary/config.yaml` format
- Line 175: References `config/config.example.json`
- Line 183-187: `/fractary-work:init` command examples
- Line 579: References old config location

**Recommended updates:**
```markdown
## Configuration

**v2.0+**: Configuration is now in `.fractary/core/config.yaml` (unified config).

Initialize with:
```bash
fractary-core:init --plugins work
# Or deprecated wrapper:
/fractary-work:init
```

Configuration format:
```yaml
version: "2.0"

work:
  active_handler: github
  handlers:
    github:
      owner: myorg
      repo: myrepo
      token: ${GITHUB_TOKEN}
      classification:
        feature: [feature, enhancement]
        bug: [bug, fix]
```

See `.fractary/core/config.example.yaml` for complete examples.
```

### plugins/repo/README.md
**Lines needing updates:**
- Line 60-72: Setup section with old init instructions
- Line 76-106: Manual setup with old config format `~/.fractary/repo/config.json`

**Recommended updates:**
```markdown
## Setup

**Quick setup (Recommended):**
```bash
fractary-core:init --plugins repo
```

**Manual setup:**
1. Create `.fractary/core/config.yaml`
2. Add repo configuration:
```yaml
version: "2.0"

repo:
  active_handler: github
  handlers:
    github:
      token: ${GITHUB_TOKEN}
  defaults:
    default_branch: main
```

See [Configuration Guide](../../docs/guides/configuration.md) for details.
```

### plugins/docs/README.md
**Lines needing updates:**
- Line 649: References `.fractary/config.yaml`

**Recommended update:**
Replace with: "Configuration is in `.fractary/core/config.yaml` under the `docs` section."

### plugins/file/README.md
**Lines needing updates:**
- Line 152: `vim .fractary/config.yaml`
- Line 346-353: Configuration location section
- Line 665-666: File permissions for old config
- Line 782: Copy example config command
- Line 789: Handler configuration reference

**Recommended updates:**
- Replace all `.fractary/config.yaml` with `.fractary/core/config.yaml`
- Update configuration section to show unified config format
- Update init instructions to use `fractary-core:init --plugins file`

### plugins/logs/README.md
**Status:** ✅ Updated to reference unified `.fractary/config.yaml` configuration.

## 📋 Additional Documentation to Consider

### Files that may need review:
1. **docs/guides/api-reference.md** - Check for any config path references
2. **docs/examples/README.md** - May contain old config examples
3. **Plugin command documentation** (`plugins/*/commands/*.md`) - May reference old init commands
4. **Plugin skill documentation** - May have config references

### Files that are okay:
- **docs/MIGRATION-PLAN.md** - Historical document, okay to keep as-is
- **docs/plans/plugin-v3-migration-plan.md** - Historical plan document
- **docs/plugin-development/context-argument-standard.md** - Development guide, no config references

## 🎯 Recommended Next Steps

1. **Update plugin READMEs** (Priority: High)
   - Update work, repo, file, logs, docs plugin READMEs
   - Add v2.0 config examples
   - Add deprecation notices for old config paths
   - Link to unified configuration guide

2. **Update command documentation** (Priority: Medium)
   - Review all `/init` command docs in `plugins/*/commands/`
   - Add v2.0 migration notes
   - Update examples to use unified init

3. **Update example configurations** (Priority: Medium)
   - Update or remove `plugins/*/config/config.example.json` files
   - Add references to `.fractary/core/config.example.yaml`

4. **Create migration helpers** (Priority: Low)
   - Script to convert old configs to new format
   - Validation tool to check for old config references

## 📝 Documentation Standards for v2.0

When updating documentation, follow these standards:

### Config Path References
- ✅ `.fractary/core/config.yaml` (unified config)
- ❌ `.fractary/core.yaml` (incorrect)
- ❌ `.fractary/plugins/{name}/config.json` (deprecated)

### Init Command References
- ✅ `fractary-core:init` (recommended)
- ✅ `fractary-core:init --plugins work` (specific plugins)
- ⚠️ `/fractary-work:init` (deprecated but supported with notice)

### Config Format Examples
Always show v2.0 format with:
- `version: "2.0"` field
- Handler pattern: `active_handler` + `handlers`
- Environment variables: `${VAR_NAME}` or `${VAR_NAME:-default}`

### Migration Guidance
Include migration notice at top of setup sections:
```markdown
**v2.0+**: This plugin uses the unified configuration system.
See the [Migration Guide](../../docs/guides/configuration.md#migration-guide) if upgrading from v1.x.
```

## 📊 Summary

**Completed:** 7/12 core documentation files
**Remaining:** 5 plugin READMEs + miscellaneous command docs

**Priority:**
1. ✅ **Critical** (Complete): Configuration guide, CHANGELOG, main README
2. ⚠️ **High** (Remaining): Plugin READMEs with setup instructions
3. 📋 **Medium** (To review): Command docs, examples
4. 📝 **Low** (Nice to have): Migration scripts, additional examples
