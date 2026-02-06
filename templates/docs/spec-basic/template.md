---
title: "{{title}}"
fractary_doc_type: spec-basic
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

## Objective

{{objective}}

{{#context}}
## Context

{{context}}
{{/context}}

## Requirements

{{#requirements}}
- [ ] {{.}}
{{/requirements}}

## Acceptance Criteria

{{#acceptance_criteria}}
- [ ] {{.}}
{{/acceptance_criteria}}

{{#testing}}
## Testing

{{testing}}
{{/testing}}

{{#notes}}
## Notes

{{notes}}
{{/notes}}
