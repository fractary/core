/**
 * Standards Documentation doc type definition
 */

import { DocType } from '../types';

export const standardsType: DocType = {
  id: 'standards',
  displayName: 'Standards & Conventions',
  description: 'Coding standards, style guides, and team conventions',
  template: `# {{title}}

## Overview

{{overview}}

## Scope

{{scope}}

## Standards

{{#standards}}
### {{name}}

{{description}}

{{#rules}}
#### {{title}}

{{description}}

{{#examples}}
**{{type}}:**
\`\`\`{{language}}
{{code}}
\`\`\`
{{/examples}}

{{/rules}}

{{/standards}}

## Exceptions

{{#exceptions}}
- **{{context}}**: {{description}}
{{/exceptions}}

## Enforcement

{{enforcement}}

## References

{{#references}}
- [{{title}}]({{url}})
{{/references}}

## Changelog

{{#changelog}}
- **{{date}}**: {{change}}
{{/changelog}}
`,
  outputPath: 'docs/standards',
  fileNaming: {
    pattern: 'STD-{slug}.md',
    slugSource: 'title',
    slugMaxLength: 50,
  },
  frontmatter: {
    requiredFields: ['title', 'type', 'status', 'date'],
    optionalFields: ['owner', 'applies_to', 'tags', 'related', 'version'],
    defaults: {
      type: 'standards',
      status: 'draft',
    },
  },
  structure: {
    requiredSections: ['Overview', 'Standards'],
    optionalSections: ['Scope', 'Exceptions', 'Enforcement', 'References', 'Changelog'],
    sectionOrder: [
      'Overview',
      'Scope',
      'Standards',
      'Exceptions',
      'Enforcement',
      'References',
      'Changelog',
    ],
  },
  status: {
    allowedValues: ['draft', 'review', 'approved', 'deprecated'],
    default: 'draft',
  },
  indexConfig: {
    indexFile: 'docs/standards/README.md',
    sortBy: 'title',
    sortOrder: 'asc',
    entryTemplate: '- [{{title}}]({{relative_path}}) - {{status}}',
  },
  standards: `# Standards Documentation Standards

## Required Conventions

- ALWAYS include clear scope
- ALWAYS provide examples
- ALWAYS document exceptions
- ALWAYS explain enforcement

## Best Practices

- Include good and bad examples
- Version standards documents
- Track changes in changelog
- Reference external standards
`,
};
