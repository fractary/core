# Changelog Documentation Standards

## Purpose

Changelog documents track all notable changes to a project, organized by version and date. They provide a human-readable history of development, releases, and evolution following the Keep a Changelog format.

**Use for**:
- Project release history
- Version tracking across releases
- User-facing change documentation
- Migration guidance between versions
- Breaking change communication

**Do NOT use for**:
- Individual release logs (use fractary-logs changelog type)
- Build logs or deployment logs
- Development notes or internal documentation

---

## Required Conventions

### 1. File Naming
- ALWAYS name the file `CHANGELOG.md` (uppercase, .md extension)
- ALWAYS place at project or plugin root directory
- NEVER use custom names (breaking convention makes it harder to find)

### 2. Version Numbering
- ALWAYS follow Semantic Versioning (semver.org)
- Format: `MAJOR.MINOR.PATCH` (e.g., `2.1.0`)
- MAJOR: Breaking changes (incompatible API changes)
- MINOR: New features (backwards-compatible)
- PATCH: Bug fixes (backwards-compatible)
- Pre-release: `1.0.0-alpha.1`, `1.0.0-beta.2`, `1.0.0-rc.1`

### 3. Date Format
- ALWAYS use ISO 8601 date format: `YYYY-MM-DD`
- Example: `2026-01-09`
- NEVER use other formats (e.g., `Jan 9, 2026`, `01/09/2026`)

### 4. Version Headers
- Format: `## [VERSION] - YYYY-MM-DD`
- Example: `## [2.1.0] - 2026-01-09`
- ALWAYS include square brackets around version
- ALWAYS include date after version

### 5. Categories
- ALWAYS use standard Keep a Changelog categories:
  - **Added**: New features
  - **Changed**: Changes to existing functionality
  - **Deprecated**: Soon-to-be removed features
  - **Removed**: Removed features
  - **Fixed**: Bug fixes
  - **Security**: Security-related changes
- Optional categories:
  - **Breaking Changes**: Major breaking changes (for MAJOR versions)
  - **Performance**: Performance improvements
  - **Dependencies**: Dependency updates
  - **Migration Guide**: Step-by-step upgrade instructions
  - **Known Issues**: Known problems in this release

### 6. Version Order
- ALWAYS list versions in descending order (newest first)
- Unreleased section (if used) goes at the top
- Example order: Unreleased → 2.1.0 → 2.0.0 → 1.0.0

---

## Best Practices

### 1. Breaking Changes
- ALWAYS document breaking changes prominently
- Place in dedicated "Breaking Changes" section before other categories
- Include migration notes explaining how to upgrade
- Increment MAJOR version when introducing breaking changes

**Example**:
```markdown
### Breaking Changes

#### Configuration Format Changed

The configuration format has changed from JSON to YAML.

**Migration Guide**: Convert your `.fractary/config.json` to `.fractary/core/config.yaml`.
Run `fractary-core:init` to generate the new format.
```

### 2. Entry Format
- Start each entry with a bullet point (`-`)
- Write in imperative mood ("Add feature" not "Added feature")
- Be concise but descriptive
- Link to issues/PRs when relevant: `(#123)`, `[#123](url)`
- Group related changes under component headings

**Good**:
```markdown
- Add user authentication with OAuth2 support (#142)
- Fix memory leak in log processing (#156)
```

**Bad**:
```markdown
- Added stuff
- Various fixes
- Updated code
```

### 3. Unreleased Section
- Use `## [Unreleased]` for changes not yet released
- Move to versioned section when releasing
- Helps track work-in-progress changes

### 4. Component Organization
- For large releases, group changes by component
- Use level 4 headers (`####`) for components within categories

**Example**:
```markdown
### Added

#### Core Plugin
- New initialization command
- Configuration validation

#### Work Plugin
- Bulk issue creation
- Issue refinement workflow
```

### 5. Links Section
- Include version comparison links at bottom
- Format: `[VERSION]: comparison-url`
- Example: `[2.1.0]: https://github.com/org/repo/compare/v2.0.0...v2.1.0`

### 6. Header and Footer
- Include project description in header
- Reference Keep a Changelog and Semantic Versioning
- Optional: Add legend explaining categories
- Optional: Add links to related documentation

---

## Content Guidelines

### What to Include
- All user-visible changes
- API changes and new features
- Breaking changes with migration notes
- Security fixes and vulnerabilities
- Bug fixes affecting users
- Deprecated features with timeline
- Performance improvements (if significant)
- Dependency updates (if significant)

### What to Exclude
- Internal refactoring (unless affects users)
- Code style changes
- Documentation typos
- Development tooling updates
- CI/CD configuration
- Implementation details (save for commit messages)

---

## Examples

### Simple Release
```markdown
## [1.2.0] - 2026-01-09

### Added
- User authentication with OAuth2
- Export functionality for reports

### Fixed
- Memory leak in background processor
- Timezone handling in date fields
```

### Major Release with Breaking Changes
```markdown
## [2.0.0] - 2026-01-09

### Breaking Changes

#### Python 2 Support Removed

Python 2 reached end-of-life. This version requires Python 3.8+.

**Migration Guide**: Upgrade your environment to Python 3.8 or later.
See [Python 3 Migration Guide](link) for details.

### Added
- Async/await support throughout API
- New plugin system for extensibility

### Changed
- Configuration moved from JSON to YAML format
- Default logging level changed to INFO

### Removed
- Python 2.7 compatibility layer
- Legacy API endpoints (deprecated in v1.5.0)
```

---

## Quality Checklist

Before finalizing a changelog:

- [ ] All versions follow semver format
- [ ] All dates use ISO 8601 format (YYYY-MM-DD)
- [ ] Versions are in descending order (newest first)
- [ ] Breaking changes are clearly marked
- [ ] Migration guides provided for breaking changes
- [ ] Entries are clear and user-focused
- [ ] Standard category names used
- [ ] No sensitive information or secrets included
- [ ] Links to issues/PRs included where relevant
- [ ] Compare URLs provided for each version
- [ ] Header references Keep a Changelog and Semver

---

## Anti-Patterns to Avoid

1. **Vague entries**: "Various improvements" → Be specific
2. **Technical jargon**: "Refactored flux capacitor" → Explain user impact
3. **Missing dates**: Always include release date
4. **Wrong order**: Always newest first
5. **No breaking change warnings**: Always highlight breaking changes
6. **Implementation details**: Focus on what changed, not how
7. **Dump of commit messages**: Synthesize and organize changes
8. **Inconsistent formatting**: Follow the standard consistently

---

## Maintenance

- Update on every release (don't let it fall behind)
- Review and cleanup draft entries before release
- Ensure consistency in tone and format
- Archive very old versions to separate file if changelog gets too long (100+ versions)
- Keep recent history (last 10-20 versions) in main CHANGELOG.md
