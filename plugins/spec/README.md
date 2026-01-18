# Fractary Spec Plugin

**Ephemeral Specifications with Lifecycle-Based Archival**

The fractary-spec plugin manages point-in-time specifications tied to work items. Unlike documentation (living state), specs are temporary requirements that become stale once work completes. This plugin handles the full lifecycle: generation from issues, validation against implementation, and archival to cloud storage.

## Philosophy

**Specs ≠ Docs**

- **Specs**: Ephemeral, point-in-time requirements. Archived when complete.
- **Docs**: Living state, continuously updated. Never archived.

Keeping old specs in the workspace pollutes context. This plugin archives completed specs to cloud storage and removes them locally, keeping only active specifications in the workspace.

## Specification Creation

### The `/fractary-spec:create` Command

**When to use**:
- After planning discussions with Claude
- Rich design conversations about architecture, approach, tradeoffs
- Want to capture the full planning context, not just issue text
- Working on issue-tied branches (auto-detects issue ID)
- Exploratory work (standalone specs)

**How it works**:
- Uses full conversation context as primary source
- **Auto-detects work ID** from branch name (e.g., `feat/123-name` → issue #123)
- Optionally enriches with issue data (when work_id detected or provided via `--work-id`)
- Directly invokes skill to preserve context
- Auto-detects template from conversation
- Naming: `WORK-*` (with work_id) or `SPEC-*` (standalone)

**Key Feature**: If you're on a branch tied to an issue (e.g., `feat/123-auth`), the command automatically detects and links to that issue - no need to specify `--work-id` manually.

## Features

- ✅ **Context Preservation**: Direct skill invocation preserves planning discussions
- ✅ **Auto-Detection**: Automatically detects issue ID from branch name (via repo plugin)
- ✅ **Issue Enrichment**: Fetches full issue data (description + all comments)
- ✅ **Smart Templates**: Auto-selects template based on work type or context
- ✅ **Validation**: Checks implementation completeness
- ✅ **Lifecycle Archival**: Archives when issue closes or PR merges
- ✅ **Cloud Storage**: Uses fractary-file for archival
- ✅ **GitHub Integration**: Comments on issues/PRs with spec links
- ✅ **FABER Integration**: Automatic workflow in FABER phases
- ✅ **Read from Cloud**: Access archived specs without download

## Installation

### Prerequisites

- `fractary-repo` plugin (GitHub integration, issue fetching)
- `fractary-file` plugin (cloud storage)

### Initialize

```bash
/fractary-spec:init
```

Creates:
- Configuration file
- `/specs` directory
- Archive index

## Quick Start

### 1. Create Specification

#### Recommended: On Issue Branch (Auto-Detection)

```bash
# Create/checkout issue branch
/fractary-repo:branch-create "implement auth" --work-id 123

# Discuss and plan with Claude
# ... conversation about approach, design, requirements ...

# Create spec (auto-detects issue #123 from branch)
/fractary-spec:create
```

- Auto-detects issue #123 from branch `feat/123-implement-auth`
- Uses full conversation context as primary source
- Enriches with issue data (description + all comments)
- Creates `/specs/WORK-00123-implement-auth.md`
- Comments on issue #123

#### With Explicit Work ID

```bash
/fractary-spec:create --work-id 123
```

- Explicitly links to issue #123 (overrides branch detection)
- Use when you want to link to a different issue

#### Standalone Spec (No Issue)

```bash
/fractary-spec:create
```

- Uses only conversation context
- Creates `/specs/SPEC-20250115143000-feature.md`
- No GitHub linking

### 2. Implement Following Spec

Use spec as guide during development.

### 3. Validate Implementation

```bash
/fractary-spec:validate 123
```

Checks:
- Requirements coverage
- Acceptance criteria
- Files modified
- Tests added
- Docs updated

### 4. Archive When Complete

```bash
/fractary-spec:archive 123
```

When issue closes or PR merges:
- Uploads to cloud
- Comments on GitHub
- Removes from local

### 5. Read Archived Spec

```bash
/fractary-spec:read 123
```

Streams from cloud without local download.

## Commands

| Command | Description |
|---------|-------------|
| `/fractary-spec:init` | Initialize plugin |
| `/fractary-spec:create [--work-id <id>]` | Create spec from conversation context (auto-detects issue from branch) |
| `/fractary-spec:validate <issue>` | Validate implementation |
| `/fractary-spec:archive <issue>` | Archive to cloud |
| `/fractary-spec:read <issue>` | Read archived spec |

## Global Arguments

All commands support the `--context` argument for passing additional instructions:

```bash
--context "<text>"
```

This argument is always optional and appears as the final argument. When provided, agents prepend the context as additional instructions to their workflow.

**Examples:**

```bash
# Guide spec creation
/fractary-spec:create --work-id 123 --context "Prioritize security requirements"

# Focus validation
/fractary-spec:validate 123 --context "Emphasize test coverage requirements"

# Customize refinement
/fractary-spec:refine 123 --context "Focus on API design and error handling"
```

See [Context Argument Standard](../../docs/plugin-development/context-argument-standard.md) for full documentation.

### Key Features of `create`

- **Auto-Detection**: Automatically detects issue ID from current branch name (via repo plugin)
- **Context Preservation**: Direct skill invocation preserves full conversation context
- **Issue Enrichment**: Optionally fetches issue data when work_id detected or provided
- **Flexible Naming**: `WORK-{id:05d}-*` (with issue) or `SPEC-{timestamp}-*` (standalone)
- **Template Auto-Selection**: Infers template from conversation and issue context

See `commands/*.md` for detailed usage.

## Templates

### Auto-Selected Based on Work Type

- **basic**: General-purpose (default)
- **feature**: User stories, UI/UX, rollout plans
- **infrastructure**: Resources, deployment, monitoring
- **api**: Endpoints, models, authentication
- **bug**: Root cause, fix approach, prevention

### Classification Rules

| Type | Detection |
|------|-----------|
| Bug | Labels: "bug", "defect", "hotfix" |
| Feature | Labels: "feature", "enhancement" |
| Infrastructure | Labels: "infrastructure", "devops", "cloud" |
| API | Labels: "api", "endpoint", "rest" |

Override with `--template` option.

## Validation

Before archiving, validate implementation:

```bash
/fractary-spec:validate 123
```

### Checks

- **Requirements**: All implemented?
- **Acceptance Criteria**: All met? (checkboxes)
- **Files Modified**: Expected files changed?
- **Tests Added**: Test coverage adequate?
- **Docs Updated**: Documentation current?

### Validation Status

- **Complete** ✓: All checks pass
- **Partial** ⚠: Most pass, some warnings
- **Incomplete** ✗: Critical failures

## Archival

When work completes:

```bash
/fractary-spec:archive 123
```

### Why Archive Specs?

Specs become **outdated and misleading** once work is complete. If Claude finds an old spec during searches, it may rely on that information which no longer reflects the current codebase. Archiving:

1. **Removes specs from the workspace** - Prevents accidental discovery
2. **Preserves them for reference** - You can still explicitly access archived specs
3. **Keeps Claude focused on current information** - No stale context pollution

### Archive Modes

The archive command supports two modes:

| Mode | Description | When Used |
|------|-------------|-----------|
| **Cloud Storage** (Preferred) | Uploads to S3/R2/GCS | When `fractary-file` is configured |
| **Local Archive** (Fallback) | Moves to `.fractary/specs/archive/` | When cloud storage not configured |

**Automatic Mode Detection**: The archive command automatically detects which mode to use based on whether cloud storage is configured.

**Force Local Archive**: Use `--local` flag to skip cloud storage attempt:
```bash
/fractary-spec:archive 123 --local
```

### Local Archive (Default Fallback)

When cloud storage is not configured, specs are archived locally:

```
.fractary/specs/archive/
├── WORK-00123-feature.md
├── WORK-00124-bugfix.md
└── ...
```

The archive mirrors the local structure - specs are moved to the archive root while preserving their original filenames.

**Key Points**:
- The archive directory is **gitignored** (won't be committed)
- The archive directory is **hidden from Claude** (via `.claude/settings.json` deny rules)
- Specs are preserved locally but won't pollute Claude's context

### Cloud Archive (Preferred)

When `fractary-file` plugin is configured with cloud storage:

```
Cloud: archive/specs/{filename}
Local: Spec files are removed after successful upload
```

The cloud archive path mirrors the local structure - only the root differs.

**Benefits over local archive**:
- Specs completely removed from local machine
- Accessible from any machine via `/fractary-spec:read`
- Two-tier index ensures recoverability

### Configuring Cloud Storage

To enable cloud archiving, configure the `file` section in `.fractary/config.yaml`:

```yaml
file:
  schema_version: "2.0"
  sources:
    specs:
      type: s3           # Options: s3, r2, gcs, gdrive, local
      bucket: my-project-files
      prefix: specs/
      region: us-east-1
      local:
        base_path: .fractary/specs
      push:
        compress: false
        keep_local: false  # Remove local after upload
      auth:
        profile: default   # AWS profile or use env vars
```

**For Cloudflare R2:**
```yaml
file:
  sources:
    specs:
      type: r2
      bucket: my-project-files
      prefix: specs/
      account_id: ${CLOUDFLARE_ACCOUNT_ID}
      auth:
        access_key_id: ${R2_ACCESS_KEY_ID}
        secret_access_key: ${R2_SECRET_ACCESS_KEY}
```

After configuring, the archive command will automatically use cloud storage.

### Pre-Archive Checks

**Required**:
- Issue closed OR PR merged
- Specs exist

**Warnings** (prompt if fail):
- Documentation updated?
- Validation complete?

### Archival Process

1. Collect all specs for issue
2. Check conditions
3. **Determine archive mode** (cloud or local)
4. Upload to cloud OR move to local archive
5. Comment on GitHub (issue + PR)
6. Remove original spec files
7. Git commit

### Archive Location

Archive paths are root directories. The spec plugin determines file naming during creation;
archive simply mirrors the local structure.

**Cloud Storage (when configured):**
```
Cloud: archive/specs/{filename}
```

**Local Archive (fallback):**
```
Archive: .fractary/specs/archive/{filename}
```

### How Claude is Protected from Archived Specs

Both archive modes ensure Claude cannot accidentally find archived specs:

1. **Gitignore**: `.fractary/specs/archive/` is gitignored
2. **Claude Settings**: `.claude/settings.json` contains deny rules:
   ```json
   {
     "permissions": {
       "deny": [
         "Read(./.fractary/specs/archive/**)"
       ]
     }
   }
   ```

This prevents Claude's search tools (Glob/Grep/Read) from accessing archived content.

## Configuration

**v2.0+:** Configuration is in the unified **`.fractary/config.yaml`** file under the `spec` section.

Initialize the unified configuration:
```bash
fractary-core:configure
```

This creates `.fractary/config.yaml` with all plugin configurations including:
```yaml
spec:
  schema_version: "1.0"
  storage:
    local_path: .fractary/specs
    local_archive_path: .fractary/specs/archive
    cloud_archive_path: archive/specs
    # Archive paths are root directories only. The spec plugin
    # determines file naming and structure. Archive mirrors local.
  archive:
    strategy: lifecycle
    auto_archive_on:
      issue_close: true
      pr_merge: true
      faber_release: true
```

For configuration details, see the [Configuration Guide](../../docs/guides/configuration.md).

## FABER Integration

### Automatic Workflow

In `.faber.config.toml`:

```toml
[workflow.architect]
generate_spec = true
spec_plugin = "fractary-spec"
spec_command = "create"  # or "create-from-issue" for issue-centric

[workflow.evaluate]
validate_spec = true

[workflow.release]
archive_spec = true
```

### Phases

- **Architect**: Generate spec (from context or issue)
- **Evaluate**: Validate implementation
- **Release**: Archive to cloud

### Configuration

```toml
spec_command = "create"
```

The `create` command automatically:
- Uses conversation context as primary source
- Auto-detects issue ID from branch name
- Enriches with issue data when available
- Preserves full planning context

No manual commands needed in FABER workflow!

## GitHub Integration

### Spec Creation Comment

```markdown
📋 Specification Created

Specification generated for this issue:
- [WORK-00123-feature.md](/specs/WORK-00123-feature.md)

Source: Conversation context + Issue data

This spec will guide implementation and be validated before archival.
```

### Archive Comment

```markdown
✅ Work Archived

This issue has been completed and archived!

**Specifications**:
- [Phase 1: Authentication](https://storage.example.com/specs/2025/123-phase1.md) (15.4 KB)
- [Phase 2: OAuth](https://storage.example.com/specs/2025/123-phase2.md) (18.9 KB)

**Archived**: 2025-01-15 14:30 UTC
**Validation**: All specs validated ✓

These specifications are permanently stored in cloud archive for future reference.
```

## Architecture

### 3-Layer Pattern

```
Commands (Entry Points)
    ↓
Agent (spec-manager)
    ↓
Skills (generator, validator, archiver, linker)
    ↓
Scripts (Shell scripts for deterministic operations)
```

### Skills

- **spec-generator**: Create specs from issues
- **spec-validator**: Validate implementation
- **spec-archiver**: Archive to cloud
- **spec-linker**: Link specs to issues/PRs

### Agent

- **spec-manager**: Orchestrates full lifecycle

## Directory Structure

```
plugins/spec/
├── .claude-plugin/
│   └── plugin.json
├── agents/
│   └── spec-manager.md
├── commands/
│   ├── init.md
│   ├── create.md              # Spec creation (context + auto-detection)
│   ├── validate.md
│   ├── archive.md
│   └── read.md
├── skills/
│   ├── spec-generator/
│   │   ├── SKILL.md
│   │   ├── templates/
│   │   ├── workflow/
│   │   │   └── generate-from-context.md    # Context + auto-detection workflow
│   │   ├── scripts/
│   │   └── docs/
│   ├── spec-validator/
│   ├── spec-archiver/
│   └── spec-linker/
├── config/
│   └── config.example.json
└── README.md
```

## Dependencies

### Required for Core Functionality

- **fractary-file**: Cloud storage for archival (upload, read from cloud)

### Required for Full Features

- **fractary-repo**: Enables GitHub integration and auto-detection
  - **Auto-detection**: Detects issue ID from branch names (e.g., `feat/123-name` → #123)
  - **Issue enrichment**: Fetches issue description + all comments
  - **GitHub linking**: Posts spec location comments on issues/PRs
  - **Without repo plugin**: Manual `--work-id` required, no auto-detection, standalone specs only

### Optional

- **faber**: Automatic workflow integration (Architect/Evaluate/Release phases)

### Graceful Degradation

If `fractary-repo` is not installed:
- ✓ Spec creation still works (from conversation context)
- ✓ Standalone specs (SPEC-{timestamp}-* naming)
- ✗ No auto-detection of issue IDs from branch
- ✗ Must use `--work-id` explicitly to link to issues
- ✗ No GitHub comments on issues
- ℹ Info message shown: "Repo plugin not found - auto-detection disabled"

## Workflow Examples

### Example 1: Context-Based (Planning Session)

```bash
# 1. Initialize
/fractary-spec:init

# 2. Have planning discussion with Claude
# User: "Let's design a user authentication system with OAuth2..."
# Claude: [discusses requirements, architecture, approach...]

# 3. Create spec from conversation context
/fractary-spec:create --work-id 123

# Output: /specs/WORK-00123-user-auth-oauth.md
# - Captures full planning discussion
# - Enriched with issue #123 data
# - GitHub comment added

# 4. Implement following spec
# ... development work ...

# 5. Validate implementation
/fractary-spec:validate 123

# 6. Archive when complete
/fractary-spec:archive 123

# 7. Later: read archived spec
/fractary-spec:read 123
```

### Example 2: Issue-Based (Traditional)

```bash
# 1. Initialize
/fractary-spec:init

# 2. Create/checkout issue branch
/fractary-repo:branch-create "implement feature" --work-id 123

# 3. Create spec (auto-detects issue #123 from branch)
/fractary-spec:create

# Output: /specs/WORK-00123-implement-feature.md
# - Auto-detected issue #123 from branch feat/123-implement-feature
# - Uses conversation context
# - Enriches with issue description + all comments
# - Auto-detects template
# - GitHub comment added

# 4. Implement following spec
# ... development work ...

# 5. Validate implementation
/fractary-spec:validate 123

# 6. Archive when complete
/fractary-spec:archive 123

# 7. Later: read archived spec
/fractary-spec:read 123
```

### Example 3: Standalone Exploratory Spec

```bash
# After design discussion (no work item yet)
/fractary-spec:create

# Output: /specs/SPEC-20250115143000-api-design.md
# - Standalone spec
# - No GitHub linking
# - For reference/planning
```

## Best Practices

### Spec Generation

**Recommended Workflow**:
1. Create/checkout issue branch using `/fractary-repo:branch-create --work-id <id>`
2. Discuss and plan with Claude (capture requirements, architecture, approach)
3. Run `/fractary-spec:create` (auto-detects issue from branch)
4. Spec is created with full conversation context + issue enrichment

**When to Use `--work-id` Explicitly**:
- You want to link to a different issue than the current branch
- You're on `main` or a non-issue branch but want to link to an issue
- You're overriding the auto-detected issue

**General Tips**:
- Generate specs early (Architect phase)
- Work on issue-tied branches for automatic detection
- Let auto-classification choose template
- Override template if needed with `--template`

### During Development

- Refer to spec regularly
- Update acceptance criteria checkboxes
- Keep spec in sync with reality

### Validation

- Validate before archival
- Address warnings promptly
- Use validation as checklist

### Archival

- Archive when work complete
- Don't skip pre-archive checks
- Update docs before archiving
- Let FABER handle automatically

### Reading Archives

- Read for reference only
- Don't maintain local copies
- Link to archived specs in docs

## Troubleshooting

### Spec Generation Issues

**Issue not found**:
- Check issue number
- Verify GitHub access

**Template not found**:
- Falls back to basic template
- Check plugin installation

### Validation Issues

**Spec not found**:
- Generate spec first
- Check issue number

**Git errors**:
- Some checks require git
- Manual verification needed

### Archival Issues

**Upload failed**:
- Check cloud storage config
- Verify fractary-file plugin
- Retry after fixing

**Index update failed**:
- Critical error
- Manual index update needed

**Pre-checks failed**:
- Close issue or merge PR
- Or use --force to override

## Advanced Usage

### Custom Templates

Add custom templates to `skills/spec-generator/templates/`.

### Configuration Overrides

Override defaults per project in config file.

### Integration with CI/CD

```bash
# In CI pipeline
/fractary-spec:validate $ISSUE_NUMBER
```

Fail build if validation incomplete.

## Contributing

Contributions welcome! See main repository for guidelines.

## License

Same as parent repository.

## Support

- GitHub Issues: Report bugs and feature requests
- Documentation: See `/docs` directory
- FABER Integration: See FABER documentation

## Version

2.0.6 - Upload verification and defense in depth

## Changelog

### 2.0.6

- **security**: Add upload verification to all cloud storage handlers (S3, R2, GCS)
- **security**: Exit code 13 for upload verification failures
- **reliability**: Agent now performs independent verification after upload scripts return
- **reliability**: Defense in depth - local files only deleted after cloud verification confirms success
- **docs**: Added UPLOAD_VERIFICATION section to spec-archive agent with verification instructions

### 1.0.1

- **fix**: Upload specs to correct cloud archive path (`archive/specs/` instead of `specs/`)
- **fix**: Proper R2 handler support with `account_id` parameter
- **fix**: Correct GCS handler parameter order (7 params)
- **security**: Add path traversal validation for cloud paths
- **reliability**: Add checksum verification before deleting original files

### 1.0.0

- Initial release

