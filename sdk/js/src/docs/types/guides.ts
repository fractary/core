/**
 * Guides Documentation doc type definition
 */

import { DocType } from '../types';

export const guidesType: DocType = {
  id: 'guides',
  displayName: 'How-to Guide',
  description: 'Step-by-step tutorials and how-to guides',
  template: `# {{title}}

## Overview

{{overview}}

## Prerequisites

{{#prerequisites}}
- {{.}}
{{/prerequisites}}

## Steps

{{#steps}}
### Step {{number}}: {{title}}

{{description}}

{{#code}}
\`\`\`{{language}}
{{code}}
\`\`\`
{{/code}}

{{#note}}
> **Note:** {{note}}
{{/note}}

{{#warning}}
> ⚠️ **Warning:** {{warning}}
{{/warning}}

{{/steps}}

## Verification

{{verification}}

## Troubleshooting

{{#troubleshooting}}
### {{problem}}

**Solution:** {{solution}}
{{/troubleshooting}}

## Next Steps

{{#next_steps}}
- [{{title}}]({{path}})
{{/next_steps}}

## Related Guides

{{#related}}
- [{{title}}]({{path}})
{{/related}}
`,
  outputPath: 'docs/guides',
  fileNaming: {
    pattern: 'GUIDE-{slug}.md',
    slugSource: 'title',
    slugMaxLength: 50,
  },
  frontmatter: {
    requiredFields: ['title', 'type', 'date'],
    optionalFields: ['author', 'difficulty', 'time_required', 'tags', 'related', 'prerequisites'],
    defaults: {
      type: 'guides',
      difficulty: 'intermediate',
    },
  },
  structure: {
    requiredSections: ['Overview', 'Prerequisites', 'Steps'],
    optionalSections: ['Verification', 'Troubleshooting', 'Next Steps', 'Related Guides'],
    sectionOrder: [
      'Overview',
      'Prerequisites',
      'Steps',
      'Verification',
      'Troubleshooting',
      'Next Steps',
      'Related Guides',
    ],
  },
  status: {
    allowedValues: ['draft', 'review', 'published', 'outdated'],
    default: 'draft',
  },
  indexConfig: {
    indexFile: 'docs/guides/README.md',
    sortBy: 'title',
    sortOrder: 'asc',
    entryTemplate: '- [{{title}}]({{relative_path}}) - {{difficulty}}',
  },
  standards: `# Guide Documentation Standards

## Required Conventions

- ALWAYS include clear overview
- ALWAYS list prerequisites
- ALWAYS provide step-by-step instructions
- ALWAYS include verification steps

## Best Practices

- Use numbered steps
- Include code examples
- Add troubleshooting section
- Link to related guides
- Specify difficulty level
`,
};
