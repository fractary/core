/**
 * ETL Pipeline Documentation doc type definition
 */

import { DocType } from '../types';

export const etlType: DocType = {
  id: 'etl',
  displayName: 'ETL Pipeline Documentation',
  description: 'Data pipeline and ETL job documentation',
  template: `# {{title}}

## Overview

{{description}}

## Pipeline Diagram

\`\`\`mermaid
{{diagram}}
\`\`\`

## Sources

{{#sources}}
### {{name}}

- **Type:** {{type}}
- **Connection:** {{connection}}
- **Schedule:** {{schedule}}
- **Description:** {{description}}
{{/sources}}

## Transformations

{{#transformations}}
### {{name}}

**Input:** {{input}}
**Output:** {{output}}

{{description}}

\`\`\`{{language}}
{{code}}
\`\`\`
{{/transformations}}

## Destinations

{{#destinations}}
### {{name}}

- **Type:** {{type}}
- **Connection:** {{connection}}
- **Mode:** {{mode}}
{{/destinations}}

## Schedule

- **Frequency:** {{schedule.frequency}}
- **Timezone:** {{schedule.timezone}}
- **Dependencies:** {{schedule.dependencies}}

## Monitoring

### Alerts

{{#alerts}}
- **{{name}}**: {{condition}} → {{action}}
{{/alerts}}

### Metrics

{{#metrics}}
- {{name}}: {{description}}
{{/metrics}}

## Error Handling

{{error_handling}}

## Related Pipelines

{{#related}}
- [{{name}}]({{path}})
{{/related}}
`,
  outputPath: 'docs/etl',
  fileNaming: {
    pattern: 'ETL-{slug}.md',
    slugSource: 'title',
    slugMaxLength: 50,
  },
  frontmatter: {
    requiredFields: ['title', 'type', 'status', 'date'],
    optionalFields: ['owner', 'schedule', 'tags', 'related', 'dependencies'],
    defaults: {
      type: 'etl',
      status: 'draft',
    },
  },
  structure: {
    requiredSections: ['Overview', 'Sources', 'Transformations', 'Destinations'],
    optionalSections: [
      'Pipeline Diagram',
      'Schedule',
      'Monitoring',
      'Error Handling',
      'Related Pipelines',
    ],
    sectionOrder: [
      'Overview',
      'Pipeline Diagram',
      'Sources',
      'Transformations',
      'Destinations',
      'Schedule',
      'Monitoring',
      'Error Handling',
      'Related Pipelines',
    ],
  },
  status: {
    allowedValues: ['draft', 'development', 'staging', 'production', 'deprecated'],
    default: 'draft',
  },
  indexConfig: {
    indexFile: 'docs/etl/README.md',
    sortBy: 'title',
    sortOrder: 'asc',
    entryTemplate: '- [{{title}}]({{relative_path}}) - {{status}}',
  },
  standards: `# ETL Pipeline Documentation Standards

## Required Conventions

- ALWAYS document data sources
- ALWAYS document transformations
- ALWAYS document destinations
- ALWAYS include scheduling information

## Best Practices

- Include pipeline diagrams
- Document error handling
- Set up monitoring and alerts
- Track data lineage
`,
};
