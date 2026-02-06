---
title: "{{title}}"
fractary_doc_type: spec-bug
status: {{status}}
date: {{date}}
{{#work_id}}
work_id: "{{work_id}}"
{{/work_id}}
{{#work_type}}
work_type: {{work_type}}
{{/work_type}}
source: {{source}}
validation_status: not_validated
tags: []
---

# {{title}}

## Bug Description

{{description}}

## Steps to Reproduce

1. {{#steps}}{{.}}
{{/steps}}

**Expected:** {{expected}}

**Actual:** {{actual}}

{{#root_cause}}
## Root Cause Analysis

{{root_cause}}
{{/root_cause}}

## Proposed Solution

{{solution}}

## Affected Areas

{{#affected_areas}}
- {{.}}
{{/affected_areas}}

## Testing

### Regression Tests

{{#regression_tests}}
- [ ] {{.}}
{{/regression_tests}}

### Edge Case Tests

{{#edge_case_tests}}
- [ ] {{.}}
{{/edge_case_tests}}

{{#regression_risk}}
## Regression Risk

{{regression_risk}}
{{/regression_risk}}
