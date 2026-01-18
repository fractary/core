/**
 * Changelog Documentation doc type definition
 */

import { DocType } from '../types';

export const changelogType: DocType = {
  id: 'changelog',
  displayName: 'Changelog',
  description: 'Version history and release notes',
  template: `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

{{#releases}}
## [{{version}}] - {{date}}

{{#added}}
### Added
{{#added}}
- {{.}}
{{/added}}
{{/added}}

{{#changed}}
### Changed
{{#changed}}
- {{.}}
{{/changed}}
{{/changed}}

{{#deprecated}}
### Deprecated
{{#deprecated}}
- {{.}}
{{/deprecated}}
{{/deprecated}}

{{#removed}}
### Removed
{{#removed}}
- {{.}}
{{/removed}}
{{/removed}}

{{#fixed}}
### Fixed
{{#fixed}}
- {{.}}
{{/fixed}}
{{/fixed}}

{{#security}}
### Security
{{#security}}
- {{.}}
{{/security}}
{{/security}}

{{/releases}}
`,
  outputPath: 'docs',
  fileNaming: {
    pattern: 'CHANGELOG.md',
    slugSource: 'title',
    slugMaxLength: 50,
  },
  frontmatter: {
    requiredFields: ['title', 'type'],
    optionalFields: ['version', 'date'],
    defaults: {
      type: 'changelog',
      title: 'Changelog',
    },
  },
  structure: {
    requiredSections: [],
    optionalSections: ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'],
    sectionOrder: ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'],
  },
  status: {
    allowedValues: ['current'],
    default: 'current',
  },
  standards: `# Changelog Documentation Standards

## Required Conventions

- Follow Keep a Changelog format
- Use Semantic Versioning
- Group changes by type (Added, Changed, etc.)
- Include dates for each release

## Best Practices

- Write user-facing descriptions
- Link to issues/PRs where applicable
- Document breaking changes clearly
- Keep entries concise
`,
};
