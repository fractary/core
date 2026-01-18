/**
 * Infrastructure Documentation doc type definition
 */

import { DocType } from '../types';

export const infrastructureType: DocType = {
  id: 'infrastructure',
  displayName: 'Infrastructure Documentation',
  description: 'Infrastructure, deployment, and operations documentation',
  template: `# {{title}}

## Overview

{{overview}}

## Architecture

\`\`\`mermaid
{{diagram}}
\`\`\`

## Resources

{{#resources}}
### {{name}}

- **Type:** {{type}}
- **Provider:** {{provider}}
- **Region:** {{region}}
- **Configuration:** {{configuration}}
{{/resources}}

## Networking

{{networking}}

## Security

### Access Control

{{access_control}}

### Secrets Management

{{secrets_management}}

## Deployment

### Prerequisites

{{#deployment_prerequisites}}
- {{.}}
{{/deployment_prerequisites}}

### Process

{{deployment_process}}

### Rollback

{{rollback}}

## Monitoring

### Health Checks

{{#health_checks}}
- **{{name}}**: {{endpoint}} ({{interval}})
{{/health_checks}}

### Alerts

{{#alerts}}
- **{{name}}**: {{condition}} → {{action}}
{{/alerts}}

## Runbook

### Common Operations

{{#operations}}
#### {{name}}

{{description}}

\`\`\`bash
{{command}}
\`\`\`
{{/operations}}

### Incident Response

{{incident_response}}

## Related

{{#related}}
- [{{title}}]({{path}})
{{/related}}
`,
  outputPath: 'docs/infrastructure',
  fileNaming: {
    pattern: 'INFRA-{slug}.md',
    slugSource: 'title',
    slugMaxLength: 50,
  },
  frontmatter: {
    requiredFields: ['title', 'type', 'status', 'date'],
    optionalFields: ['owner', 'environment', 'tags', 'related', 'provider'],
    defaults: {
      type: 'infrastructure',
      status: 'draft',
    },
  },
  structure: {
    requiredSections: ['Overview', 'Resources', 'Deployment'],
    optionalSections: [
      'Architecture',
      'Networking',
      'Security',
      'Monitoring',
      'Runbook',
      'Related',
    ],
    sectionOrder: [
      'Overview',
      'Architecture',
      'Resources',
      'Networking',
      'Security',
      'Deployment',
      'Monitoring',
      'Runbook',
      'Related',
    ],
  },
  status: {
    allowedValues: ['draft', 'review', 'approved', 'production', 'deprecated'],
    default: 'draft',
  },
  indexConfig: {
    indexFile: 'docs/infrastructure/README.md',
    sortBy: 'title',
    sortOrder: 'asc',
    entryTemplate: '- [{{title}}]({{relative_path}}) - {{environment}} ({{status}})',
  },
  standards: `# Infrastructure Documentation Standards

## Required Conventions

- ALWAYS document all resources
- ALWAYS include deployment procedures
- ALWAYS document security configuration
- ALWAYS include runbook operations

## Best Practices

- Include architecture diagrams
- Document monitoring and alerts
- Maintain runbooks for common operations
- Document incident response procedures
`,
};
