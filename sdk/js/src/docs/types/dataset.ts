/**
 * Dataset Documentation doc type definition
 */

import { DocType } from '../types';

export const datasetType: DocType = {
  id: 'dataset',
  displayName: 'Dataset Documentation',
  description: 'Data schema documentation and field definitions',
  template: `# {{title}}

## Overview

{{description}}

## Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
{{#fields}}
| {{name}} | {{type}} | {{required}} | {{description}} |
{{/fields}}

## Relationships

{{#relationships}}
### {{name}}

- **Type:** {{type}}
- **Target:** {{target}}
- **Description:** {{description}}
{{/relationships}}

## Indexes

{{#indexes}}
| Name | Fields | Type |
|------|--------|------|
{{#indexes}}
| {{name}} | {{fields}} | {{type}} |
{{/indexes}}
{{/indexes}}

## Data Sources

{{#sources}}
- **{{name}}**: {{description}}
{{/sources}}

## Data Quality

### Validation Rules

{{#validation_rules}}
- {{.}}
{{/validation_rules}}

### Constraints

{{#constraints}}
- {{.}}
{{/constraints}}

## Sample Data

\`\`\`json
{{sample_data}}
\`\`\`

## Related Datasets

{{#related}}
- [{{name}}]({{path}})
{{/related}}
`,
  outputPath: 'docs/data',
  fileNaming: {
    pattern: 'DATA-{slug}.md',
    slugSource: 'title',
    slugMaxLength: 50,
  },
  frontmatter: {
    requiredFields: ['title', 'type', 'status', 'date'],
    optionalFields: ['owner', 'version', 'tags', 'related', 'source'],
    defaults: {
      type: 'dataset',
      status: 'draft',
    },
  },
  structure: {
    requiredSections: ['Overview', 'Schema'],
    optionalSections: [
      'Relationships',
      'Indexes',
      'Data Sources',
      'Data Quality',
      'Sample Data',
      'Related Datasets',
    ],
    sectionOrder: [
      'Overview',
      'Schema',
      'Relationships',
      'Indexes',
      'Data Sources',
      'Data Quality',
      'Sample Data',
      'Related Datasets',
    ],
  },
  status: {
    allowedValues: ['draft', 'review', 'approved', 'deprecated'],
    default: 'draft',
  },
  indexConfig: {
    indexFile: 'docs/data/README.md',
    sortBy: 'title',
    sortOrder: 'asc',
    entryTemplate: '- [{{title}}]({{relative_path}}) - {{status}}',
  },
  standards: `# Dataset Documentation Standards

## Required Conventions

- ALWAYS document all fields with types
- ALWAYS specify required vs optional fields
- ALWAYS include field descriptions
- ALWAYS document relationships

## Best Practices

- Include sample data
- Document validation rules
- Note data sources
- Keep schema documentation in sync with code
`,
};
