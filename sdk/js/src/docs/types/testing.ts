/**
 * Testing Documentation doc type definition
 */

import { DocType } from '../types';

export const testingType: DocType = {
  id: 'testing',
  displayName: 'Testing Documentation',
  description: 'Test plans, test results, and QA documentation',
  template: `# {{title}}

## Overview

{{overview}}

## Test Scope

### In Scope

{{#in_scope}}
- {{.}}
{{/in_scope}}

### Out of Scope

{{#out_of_scope}}
- {{.}}
{{/out_of_scope}}

## Test Environment

{{environment}}

## Test Cases

{{#test_cases}}
### {{id}}: {{title}}

**Priority:** {{priority}}
**Type:** {{type}}

**Preconditions:**
{{#preconditions}}
- {{.}}
{{/preconditions}}

**Steps:**
{{#steps}}
1. {{.}}
{{/steps}}

**Expected Result:**
{{expected_result}}

**Status:** {{status}}

{{/test_cases}}

## Test Data

{{test_data}}

## Results Summary

| Metric | Value |
|--------|-------|
| Total Tests | {{results.total}} |
| Passed | {{results.passed}} |
| Failed | {{results.failed}} |
| Skipped | {{results.skipped}} |
| Pass Rate | {{results.pass_rate}} |

## Issues Found

{{#issues}}
### {{id}}: {{title}}

**Severity:** {{severity}}
**Status:** {{status}}

{{description}}
{{/issues}}

## Recommendations

{{#recommendations}}
- {{.}}
{{/recommendations}}

## Sign-off

| Role | Name | Date | Status |
|------|------|------|--------|
{{#signoffs}}
| {{role}} | {{name}} | {{date}} | {{status}} |
{{/signoffs}}
`,
  outputPath: 'docs/testing',
  fileNaming: {
    pattern: 'TEST-{slug}.md',
    slugSource: 'title',
    slugMaxLength: 50,
  },
  frontmatter: {
    requiredFields: ['title', 'type', 'status', 'date'],
    optionalFields: ['tester', 'version', 'tags', 'related', 'test_type'],
    defaults: {
      type: 'testing',
      status: 'draft',
    },
  },
  structure: {
    requiredSections: ['Overview', 'Test Scope', 'Test Cases', 'Results Summary'],
    optionalSections: [
      'Test Environment',
      'Test Data',
      'Issues Found',
      'Recommendations',
      'Sign-off',
    ],
    sectionOrder: [
      'Overview',
      'Test Scope',
      'Test Environment',
      'Test Cases',
      'Test Data',
      'Results Summary',
      'Issues Found',
      'Recommendations',
      'Sign-off',
    ],
  },
  status: {
    allowedValues: ['draft', 'in_progress', 'completed', 'signed_off'],
    default: 'draft',
  },
  indexConfig: {
    indexFile: 'docs/testing/README.md',
    sortBy: 'date',
    sortOrder: 'desc',
    entryTemplate: '- [{{title}}]({{relative_path}}) - {{status}} ({{results.pass_rate}})',
  },
  standards: `# Testing Documentation Standards

## Required Conventions

- ALWAYS define test scope
- ALWAYS document test cases with steps
- ALWAYS include expected results
- ALWAYS track test status

## Best Practices

- Use unique test case IDs
- Document test environment
- Track issues found
- Get sign-off for releases
`,
};
