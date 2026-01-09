---
title: "{{title}}"
fractary_doc_type: changelog
project: {{project}}
status: {{status}}
date_created: {{date_created}}
{{#date_updated}}date_updated: {{date_updated}}{{/date_updated}}
{{#maintained_by}}maintained_by: {{maintained_by}}{{/maintained_by}}
{{#repository_url}}repository_url: {{repository_url}}{{/repository_url}}
{{#tags}}tags: [{{#tags}}{{.}}, {{/tags}}]{{/tags}}
codex_sync: true
generated: true
---

# {{title}}

All notable changes to {{project}} will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

{{#unreleased}}
## [Unreleased]

{{#unreleased.breaking_changes}}
### Breaking Changes

{{#unreleased.breaking_changes}}
- {{.}}
{{/unreleased.breaking_changes}}

{{/unreleased.breaking_changes}}
{{#unreleased.changes.Added}}
### Added

{{#unreleased.changes.Added}}
- {{.}}
{{/unreleased.changes.Added}}

{{/unreleased.changes.Added}}
{{#unreleased.changes.Changed}}
### Changed

{{#unreleased.changes.Changed}}
- {{.}}
{{/unreleased.changes.Changed}}

{{/unreleased.changes.Changed}}
{{#unreleased.changes.Deprecated}}
### Deprecated

{{#unreleased.changes.Deprecated}}
- {{.}}
{{/unreleased.changes.Deprecated}}

{{/unreleased.changes.Deprecated}}
{{#unreleased.changes.Removed}}
### Removed

{{#unreleased.changes.Removed}}
- {{.}}
{{/unreleased.changes.Removed}}

{{/unreleased.changes.Removed}}
{{#unreleased.changes.Fixed}}
### Fixed

{{#unreleased.changes.Fixed}}
- {{.}}
{{/unreleased.changes.Fixed}}

{{/unreleased.changes.Fixed}}
{{#unreleased.changes.Security}}
### Security

{{#unreleased.changes.Security}}
- {{.}}
{{/unreleased.changes.Security}}

{{/unreleased.changes.Security}}
{{/unreleased}}

{{#versions}}
## [{{version}}] - {{release_date}}

{{#breaking_changes}}
### Breaking Changes

{{#breaking_changes}}
{{#description}}
{{description}}
{{/description}}
{{^description}}
- {{.}}
{{/description}}

{{#migration_notes}}
**Migration Guide**: {{migration_notes}}
{{/migration_notes}}

{{/breaking_changes}}

{{/breaking_changes}}
{{#changes.Added}}
### Added

{{#changes.Added}}
- {{.}}
{{/changes.Added}}

{{/changes.Added}}
{{#changes.Changed}}
### Changed

{{#changes.Changed}}
- {{.}}
{{/changes.Changed}}

{{/changes.Changed}}
{{#changes.Deprecated}}
### Deprecated

{{#changes.Deprecated}}
- {{.}}
{{/changes.Deprecated}}

{{/changes.Deprecated}}
{{#changes.Removed}}
### Removed

{{#changes.Removed}}
- {{.}}
{{/changes.Removed}}

{{/changes.Removed}}
{{#changes.Fixed}}
### Fixed

{{#changes.Fixed}}
- {{.}}
{{/changes.Fixed}}

{{/changes.Fixed}}
{{#changes.Security}}
### Security

{{#changes.Security}}
- {{.}}
{{/changes.Security}}

{{/changes.Security}}
{{#changes.Performance}}
### Performance

{{#changes.Performance}}
- {{.}}
{{/changes.Performance}}

{{/changes.Performance}}
{{#changes.Dependencies}}
### Dependencies

{{#changes.Dependencies}}
- {{.}}
{{/changes.Dependencies}}

{{/changes.Dependencies}}
{{#migration_guide}}
### Migration Guide

{{migration_guide}}

{{/migration_guide}}
{{#known_issues}}
### Known Issues

{{#known_issues}}
- {{.}}
{{/known_issues}}

{{/known_issues}}
{{/versions}}

{{#footer}}
---

## {{footer.title}}

{{footer.content}}
{{/footer}}

{{#legend}}
---

## Legend

{{#legend}}
- **{{category}}**: {{description}}
{{/legend}}
{{^legend}}
- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security-related changes
{{/legend}}
{{/legend}}

{{#links}}
---

## Links

{{#links}}
- [{{version}}]: {{url}}
{{/links}}
{{/links}}
