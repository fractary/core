/**
 * Audit Documentation doc type definition
 */

import { DocType } from '../types';

export const auditType: DocType = {
  id: 'audit',
  displayName: 'Audit Report',
  description: 'Security audits, compliance checks, and quality assessments',
  template: `# {{title}}

## Executive Summary

{{summary}}

## Scope

{{scope}}

## Methodology

{{methodology}}

## Findings

{{#findings}}
### {{id}}: {{title}}

**Severity:** {{severity}}
**Status:** {{status}}

**Description:**
{{description}}

**Impact:**
{{impact}}

**Recommendation:**
{{recommendation}}

{{/findings}}

## Summary

| Severity | Count |
|----------|-------|
| Critical | {{counts.critical}} |
| High | {{counts.high}} |
| Medium | {{counts.medium}} |
| Low | {{counts.low}} |
| Info | {{counts.info}} |

## Recommendations

{{#recommendations}}
1. {{.}}
{{/recommendations}}

## Appendix

{{appendix}}
`,
  outputPath: 'docs/audits',
  fileNaming: {
    pattern: 'AUDIT-{date}-{slug}.md',
    slugSource: 'title',
    slugMaxLength: 40,
  },
  frontmatter: {
    requiredFields: ['title', 'type', 'status', 'date', 'auditor'],
    optionalFields: ['scope', 'tags', 'related', 'next_audit_date'],
    defaults: {
      type: 'audit',
      status: 'draft',
    },
  },
  structure: {
    requiredSections: ['Executive Summary', 'Scope', 'Findings', 'Summary'],
    optionalSections: ['Methodology', 'Recommendations', 'Appendix'],
    sectionOrder: [
      'Executive Summary',
      'Scope',
      'Methodology',
      'Findings',
      'Summary',
      'Recommendations',
      'Appendix',
    ],
  },
  status: {
    allowedValues: ['draft', 'review', 'final', 'archived'],
    default: 'draft',
  },
  indexConfig: {
    indexFile: 'docs/audits/README.md',
    sortBy: 'date',
    sortOrder: 'desc',
    entryTemplate: '- [{{title}}]({{relative_path}}) - {{date}} ({{status}})',
  },
  standards: `# Audit Documentation Standards

## Required Conventions

- ALWAYS include executive summary
- ALWAYS define clear scope
- ALWAYS categorize findings by severity
- ALWAYS provide actionable recommendations

## Best Practices

- Use consistent severity ratings
- Track finding status
- Include evidence where applicable
- Schedule follow-up audits
`,
};
