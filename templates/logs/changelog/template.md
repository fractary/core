---
log_type: changelog
title: {{title}}
change_id: {{change_id}}
date: {{date}}
version: {{version}}
change_type: {{change_type}}
{{#breaking}}
breaking: {{breaking}}
{{/breaking}}
{{#component}}
component: {{component}}
{{/component}}
{{#issue_number}}
issue_number: {{issue_number}}
{{/issue_number}}
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

# Change: {{title}}

## Summary

{{summary}}

## Type: {{change_type}}

**Breaking Change**: {{#breaking}}Yes{{/breaking}}{{^breaking}}No{{/breaking}}

## Details

{{details}}

{{#migration}}
## Migration

{{migration}}
{{/migration}}

{{#before_after}}
## Before/After

**Before**:
```
{{before}}
```

**After**:
```
{{after}}
```
{{/before_after}}

{{#related}}
## Related

{{#issue_number}}
- Issue: #{{issue_number}}
{{/issue_number}}
{{#pr_number}}
- PR: #{{pr_number}}
{{/pr_number}}
{{/related}}
