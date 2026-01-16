# Changelog Documentation Validation Rules

## Frontmatter Validation

### Required Fields
- `title` - Document title (typically "Changelog")
- `fractary_doc_type` - Must be "changelog"
- `project` - Project name this changelog tracks
- `status` - One of: active, archived, deprecated
- `date_created` - ISO 8601 timestamp when changelog was created

### Optional Fields
- `date_updated` - ISO 8601 timestamp of last update
- `maintained_by` - Person or team maintaining the changelog
- `repository_url` - Link to source repository
- `tags` - Array of tags for categorization
- `related` - Related documentation
- `codex_sync` - Enable codex synchronization (default: true)
- `generated` - Mark as generated (default: true)

### Field Validation
- `status` must be one of: active, archived, deprecated
- `date_created` and `date_updated` must be valid ISO 8601 dates
- `repository_url` must be valid URL if provided
- `project` must be non-empty string

---

## Structure Validation

### Required Sections
1. **Header** - Title and description
   - Must reference Keep a Changelog
   - Must reference Semantic Versioning
   - Must describe project being tracked

2. **Version Entries** - At least one version
   - Must have version number and release date
   - Must have at least one category of changes

### Optional Sections
- **Unreleased** - Changes not yet released
- **Footer** - Additional notes or information
- **Legend** - Explanation of categories
- **Links** - Version comparison URLs

### Section Order
1. Header (title, description, references)
2. Unreleased (if present)
3. Version entries (descending order)
4. Footer (if present)
5. Legend (if present)
6. Links (if present)

---

## Version Validation

### Version Number Format
**Pattern**: `(MAJOR).(MINOR).(PATCH)[-prerelease][+build]`

**Valid**:
- `1.0.0`
- `2.3.1`
- `1.0.0-alpha.1`
- `1.0.0-beta.2`
- `2.0.0-rc.1`
- `1.0.0+20260109`

**Invalid**:
- `1.0` (missing PATCH)
- `v1.0.0` (leading 'v')
- `1.0.0.0` (too many parts)
- `01.0.0` (leading zeros)

**Regex**:
```
^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$
```

### Version Header Format
**Pattern**: `## [VERSION] - YYYY-MM-DD`

**Valid**:
- `## [1.0.0] - 2026-01-09`
- `## [2.1.0] - 2025-12-25`
- `## [1.0.0-beta.1] - 2026-01-01`

**Invalid**:
- `## 1.0.0 - 2026-01-09` (missing brackets)
- `## [1.0.0] - Jan 9, 2026` (wrong date format)
- `## [1.0.0] 2026-01-09` (missing dash)
- `### [1.0.0] - 2026-01-09` (wrong heading level)

### Release Date Format
**Pattern**: `YYYY-MM-DD` (ISO 8601)

**Valid**:
- `2026-01-09`
- `2025-12-25`
- `2024-02-29` (leap year)

**Invalid**:
- `01/09/2026` (US format)
- `09-01-2026` (European format)
- `Jan 9, 2026` (text format)
- `2026-1-9` (missing leading zeros)

**Regex**: `^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$`

### Version Order
- Versions MUST be listed in descending order (newest first)
- Unreleased section (if present) MUST be first
- **Severity**: WARNING (allows flexibility but encourages best practice)

---

## Category Validation

### Standard Categories
- Added
- Changed
- Deprecated
- Removed
- Fixed
- Security

### Optional Categories
- Breaking Changes
- Performance
- Dependencies
- Migration Guide
- Known Issues

### Category Format
**Pattern**: `### Category Name`

**Valid**:
- `### Added`
- `### Fixed`
- `### Breaking Changes`

**Invalid**:
- `## Added` (wrong heading level)
- `#### Added` (wrong heading level)
- `### added` (lowercase)

### Category Order (Recommended)
1. Breaking Changes (if present)
2. Added
3. Changed
4. Deprecated
5. Removed
6. Fixed
7. Security
8. Performance (if present)
9. Dependencies (if present)
10. Migration Guide (if present)
11. Known Issues (if present)

**Severity**: INFO (recommended but not enforced)

---

## Content Validation

### Entry Format
- Each entry MUST start with a bullet point (`-` or `*`)
- Entries SHOULD be clear and descriptive
- Entries MAY include issue/PR references: `(#123)`, `[#123](url)`
- Entries SHOULD NOT contain implementation details

### Breaking Changes
If Breaking Changes section exists:
- MUST explain what breaks
- SHOULD include migration notes
- SHOULD increment MAJOR version

### Empty Categories
- Categories with no entries SHOULD NOT be included
- **Severity**: WARNING

---

## Dual-Format JSON Validation

If `changelog.json` exists:

### Structure Requirements
```json
{
  "title": "string",
  "project": "string",
  "format": "keep-a-changelog",
  "versions": [
    {
      "version": "string (semver)",
      "release_date": "string (ISO 8601)",
      "breaking_changes": false | array,
      "changes": {
        "Added": ["string"],
        "Changed": ["string"]
      }
    }
  ]
}
```

### Consistency Checks
- Version count in JSON MUST match Markdown
- Version numbers in JSON MUST match Markdown
- Release dates in JSON MUST match Markdown
- Categories in JSON SHOULD match Markdown
- **Severity**: ERROR for count/version mismatches, WARNING for content mismatches

---

## Custom Validation Rules

### Rule: semver_format
- **Description**: Version numbers must follow semantic versioning
- **Check**: Validate against semver regex
- **Severity**: ERROR

### Rule: date_format
- **Description**: Release dates must follow ISO 8601 (YYYY-MM-DD)
- **Check**: Validate against date regex
- **Severity**: ERROR

### Rule: version_order
- **Description**: Versions should be listed in descending order (newest first)
- **Check**: Compare version numbers sequentially
- **Severity**: WARNING

### Rule: breaking_changes_major_version
- **Description**: Breaking changes should trigger MAJOR version increment
- **Check**: If "Breaking Changes" section exists, check if MAJOR version incremented from previous
- **Severity**: WARNING

### Rule: category_names
- **Description**: Use standard Keep a Changelog category names
- **Check**: Warn if non-standard category names used
- **Severity**: INFO

### Rule: entry_format
- **Description**: Entries should start with bullet points
- **Check**: Each entry line starts with `-` or `*`
- **Severity**: WARNING

### Rule: no_empty_categories
- **Description**: Categories should not be empty
- **Check**: Each category section has at least one entry
- **Severity**: WARNING

### Rule: header_format
- **Description**: Version headers must follow standard format
- **Check**: `## [VERSION] - YYYY-MM-DD` pattern
- **Severity**: ERROR

### Rule: keep_a_changelog_reference
- **Description**: Header should reference Keep a Changelog
- **Check**: Search for "keepachangelog.com" in first 20 lines
- **Severity**: WARNING

### Rule: semver_reference
- **Description**: Header should reference Semantic Versioning
- **Check**: Search for "semver.org" in first 20 lines
- **Severity**: WARNING

---

## Validation Workflow

1. **Parse frontmatter** - Validate all required and optional fields
2. **Check structure** - Verify required sections exist
3. **Validate versions** - Check each version entry:
   - Version number format (semver)
   - Release date format (ISO 8601)
   - Header format
   - At least one category
4. **Check version order** - Verify descending order
5. **Validate categories** - Check standard names and format
6. **Validate entries** - Check bullet points and format
7. **Check breaking changes** - Verify migration notes if present
8. **Dual-format validation** - If JSON exists, verify consistency
9. **Generate report** - List all errors, warnings, and info items

---

## Validation Report Format

```
CHANGELOG VALIDATION REPORT
===========================

File: CHANGELOG.md
Project: fractary-core
Status: ✅ VALID (2 warnings, 1 info)

ERRORS: 0
---------

WARNINGS: 2
----------
[W001] Line 45: Version 1.2.0 appears before 1.3.0 (versions should be descending)
[W002] Line 78: Empty "Deprecated" section in version 1.1.0

INFO: 1
-------
[I001] Line 125: Non-standard category "Performance" used (acceptable but not in Keep a Changelog spec)

SUMMARY
-------
✅ Frontmatter valid
✅ All versions use semver format
✅ All dates use ISO 8601 format
✅ Breaking changes documented with migration notes
⚠️  Version order not strictly descending
⚠️  One empty category section
```

---

## Example Validation Cases

### Case 1: Valid Minimal Changelog
```markdown
---
title: "Changelog"
fractary_doc_type: changelog
project: my-project
status: active
date_created: 2026-01-09T10:00:00Z
---

# Changelog

All notable changes to my-project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-09

### Added
- Initial release
```

**Result**: ✅ VALID

### Case 2: Invalid Version Format
```markdown
## [1.0] - 2026-01-09
```

**Result**: ❌ ERROR - Version must follow semver (MAJOR.MINOR.PATCH)

### Case 3: Invalid Date Format
```markdown
## [1.0.0] - Jan 9, 2026
```

**Result**: ❌ ERROR - Date must follow ISO 8601 (YYYY-MM-DD)

### Case 4: Missing Required Section
```markdown
# Changelog

No versions listed.
```

**Result**: ❌ ERROR - At least one version entry required
