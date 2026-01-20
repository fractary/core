---
log_type: test
title: {{title}}
test_id: {{test_id}}
date: {{date}}
status: {{status}}
{{#test_type}}
test_type: {{test_type}}
{{/test_type}}
{{#test_framework}}
test_framework: {{test_framework}}
{{/test_framework}}
{{#pass_count}}
pass_count: {{pass_count}}
{{/pass_count}}
{{#fail_count}}
fail_count: {{fail_count}}
{{/fail_count}}
{{#skip_count}}
skip_count: {{skip_count}}
{{/skip_count}}
{{#coverage_percent}}
coverage_percent: {{coverage_percent}}
{{/coverage_percent}}
{{#duration_seconds}}
duration_seconds: {{duration_seconds}}
{{/duration_seconds}}
{{#work_id}}
work_id: {{work_id}}
{{/work_id}}
{{#tags}}
tags:
{{#tags}}
  - {{.}}
{{/tags}}
{{/tags}}
---

# Test Run: {{title}}

## Summary

- **Total**: {{total_count}}
{{#pass_count}}
- **Passed**: {{pass_count}}
{{/pass_count}}
{{#fail_count}}
- **Failed**: {{fail_count}}
{{/fail_count}}
{{#skip_count}}
- **Skipped**: {{skip_count}}
{{/skip_count}}
{{#coverage_percent}}
- **Coverage**: {{coverage_percent}}%
{{/coverage_percent}}
{{#duration_seconds}}
- **Duration**: {{duration_seconds}}s
{{/duration_seconds}}

{{#failures}}
## Failures

{{#failures}}
### {{name}}

- **Error**: {{error}}
{{#stack}}
- **Stack**:
```
{{stack}}
```
{{/stack}}

{{/failures}}
{{/failures}}

{{#output}}
## Output

```
{{output}}
```
{{/output}}
