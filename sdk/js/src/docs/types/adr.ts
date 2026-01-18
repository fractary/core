/**
 * ADR (Architecture Decision Record) doc type definition
 */

import { DocType } from '../types';

export const adrType: DocType = {
  id: 'adr',
  displayName: 'Architecture Decision Record',
  description: 'Documents significant architectural decisions, their context, and consequences',
  template: `# {{title}}

## Status

{{status}}

## Context

{{context}}

## Decision

{{decision}}

{{#alternatives}}
## Alternatives Considered

{{#alternatives}}
### {{name}}

{{description}}

**Rejected because**: {{rejection_reason}}

{{/alternatives}}
{{/alternatives}}

## Consequences

### Positive

{{#consequences.positive}}
- {{.}}
{{/consequences.positive}}

### Negative

{{#consequences.negative}}
- {{.}}
{{/consequences.negative}}

{{#references}}
## References

{{#references}}
- [{{title}}]({{url}})
{{/references}}
{{/references}}
`,
  outputPath: 'docs/architecture/adr',
  fileNaming: {
    pattern: 'ADR-{number}-{slug}.md',
    autoNumber: true,
    numberFormat: '{:05d}',
    slugSource: 'title',
    slugMaxLength: 50,
  },
  frontmatter: {
    requiredFields: ['title', 'type', 'status', 'date'],
    optionalFields: [
      'author',
      'deciders',
      'tags',
      'related',
      'supersedes',
      'superseded_by',
      'work_id',
    ],
    defaults: {
      type: 'adr',
      status: 'proposed',
    },
  },
  structure: {
    requiredSections: ['Status', 'Context', 'Decision', 'Consequences'],
    optionalSections: ['Alternatives Considered', 'References', 'Notes'],
    sectionOrder: [
      'Status',
      'Context',
      'Decision',
      'Alternatives Considered',
      'Consequences',
      'References',
      'Notes',
    ],
  },
  status: {
    allowedValues: ['proposed', 'accepted', 'deprecated', 'superseded'],
    default: 'proposed',
  },
  indexConfig: {
    indexFile: 'docs/architecture/adr/README.md',
    sortBy: 'created',
    sortOrder: 'desc',
    entryTemplate: '- [**ADR-{{number}}**: {{title}}]({{relative_path}}) - {{status}}',
  },
  standards: `# ADR Documentation Standards

## Required Conventions

### 1. Structure
- ALWAYS include title, status, and date
- ALWAYS document context (why decision needed)
- ALWAYS list decision and rationale
- ALWAYS document consequences

### 2. Status
- ALWAYS specify status (proposed, accepted, deprecated, superseded)
- ALWAYS link to superseding ADR if deprecated
- ALWAYS update status as decisions evolve

### 3. Alternatives
- ALWAYS list alternatives considered
- ALWAYS document why alternatives were rejected

### 4. Consequences
- ALWAYS document positive and negative consequences
- ALWAYS include implementation impact

## Best Practices

- Number ADRs sequentially (ADR-0001, ADR-0002, etc.)
- Keep ADRs immutable (create new ADR to change decision)
- Link related ADRs
- Review ADRs periodically for relevance
`,
};
