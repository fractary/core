/**
 * API Documentation doc type definition
 */

import { DocType } from '../types';

export const apiType: DocType = {
  id: 'api',
  displayName: 'API Documentation',
  description: 'API endpoint documentation with request/response examples',
  template: `# {{title}}

## Overview

{{description}}

## Endpoints

{{#endpoints}}
### {{method}} {{path}}

{{description}}

#### Request

{{#request_body}}
**Body:**
\`\`\`json
{{request_body}}
\`\`\`
{{/request_body}}

{{#parameters}}
**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
{{#parameters}}
| {{name}} | {{type}} | {{required}} | {{description}} |
{{/parameters}}
{{/parameters}}

#### Response

\`\`\`json
{{response}}
\`\`\`

{{/endpoints}}

## Authentication

{{authentication}}

## Error Codes

| Code | Description |
|------|-------------|
{{#error_codes}}
| {{code}} | {{description}} |
{{/error_codes}}

## Examples

{{#examples}}
### {{title}}

\`\`\`{{language}}
{{code}}
\`\`\`

{{/examples}}
`,
  outputPath: 'docs/api',
  fileNaming: {
    pattern: '{service}-{endpoint-slug}.md',
    slugSource: 'title',
    slugMaxLength: 50,
  },
  frontmatter: {
    requiredFields: ['title', 'type', 'status', 'date'],
    optionalFields: ['service', 'version', 'author', 'tags', 'related'],
    defaults: {
      type: 'api',
      status: 'draft',
    },
  },
  structure: {
    requiredSections: ['Overview', 'Endpoints', 'Authentication', 'Error Codes'],
    optionalSections: ['Examples', 'Rate Limiting', 'Pagination', 'Related Endpoints'],
    sectionOrder: [
      'Overview',
      'Endpoints',
      'Authentication',
      'Examples',
      'Error Codes',
      'Rate Limiting',
      'Pagination',
      'Related Endpoints',
    ],
  },
  status: {
    allowedValues: ['draft', 'review', 'published', 'deprecated'],
    default: 'draft',
  },
  indexConfig: {
    indexFile: 'docs/api/README.md',
    sortBy: 'title',
    sortOrder: 'asc',
    entryTemplate: '- [{{title}}]({{relative_path}}) - {{status}}',
  },
  standards: `# API Documentation Standards

## Required Conventions

- ALWAYS include endpoint path and HTTP method
- ALWAYS document request parameters and body
- ALWAYS include response examples
- ALWAYS document error codes
- ALWAYS specify authentication requirements

## Best Practices

- Use consistent naming conventions
- Include curl examples
- Document rate limits if applicable
- Version your APIs
`,
};
