/**
 * Architecture Documentation doc type definition
 */

import { DocType } from '../types';

export const architectureType: DocType = {
  id: 'architecture',
  displayName: 'Architecture Documentation',
  description: 'System architecture and design documentation',
  template: `# {{title}}

## Overview

{{overview}}

## Architecture Diagram

{{#diagram}}
\`\`\`mermaid
{{diagram}}
\`\`\`
{{/diagram}}

## Components

{{#components}}
### {{name}}

**Purpose:** {{purpose}}

**Responsibilities:**
{{#responsibilities}}
- {{.}}
{{/responsibilities}}

**Dependencies:**
{{#dependencies}}
- {{.}}
{{/dependencies}}

{{/components}}

## Data Flow

{{data_flow}}

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
{{#tech_stack}}
| {{layer}} | {{technology}} | {{purpose}} |
{{/tech_stack}}

## Security Considerations

{{security}}

## Scalability

{{scalability}}

## Related Documents

{{#related}}
- [{{title}}]({{path}})
{{/related}}
`,
  outputPath: 'docs/architecture',
  fileNaming: {
    pattern: 'ARCH-{slug}.md',
    slugSource: 'title',
    slugMaxLength: 50,
  },
  frontmatter: {
    requiredFields: ['title', 'type', 'status', 'date'],
    optionalFields: ['author', 'reviewers', 'tags', 'related', 'version'],
    defaults: {
      type: 'architecture',
      status: 'draft',
    },
  },
  structure: {
    requiredSections: ['Overview', 'Components', 'Data Flow'],
    optionalSections: [
      'Architecture Diagram',
      'Technology Stack',
      'Security Considerations',
      'Scalability',
      'Related Documents',
    ],
    sectionOrder: [
      'Overview',
      'Architecture Diagram',
      'Components',
      'Data Flow',
      'Technology Stack',
      'Security Considerations',
      'Scalability',
      'Related Documents',
    ],
  },
  status: {
    allowedValues: ['draft', 'review', 'approved', 'deprecated'],
    default: 'draft',
  },
  indexConfig: {
    indexFile: 'docs/architecture/README.md',
    sortBy: 'title',
    sortOrder: 'asc',
    entryTemplate: '- [{{title}}]({{relative_path}}) - {{status}}',
  },
  standards: `# Architecture Documentation Standards

## Required Conventions

- ALWAYS include clear overview
- ALWAYS document all major components
- ALWAYS show data flow between components
- ALWAYS document technology choices

## Best Practices

- Use diagrams (Mermaid recommended)
- Document security considerations
- Include scalability notes
- Link to related ADRs
`,
};
