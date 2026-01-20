---
log_type: audit
title: {{title}}
audit_id: {{audit_id}}
date: {{date}}
status: {{status}}
audit_type: {{audit_type}}
severity: {{severity}}
{{#user}}
user: {{user}}
{{/user}}
{{#action}}
action: {{action}}
{{/action}}
{{#resource}}
resource: {{resource}}
{{/resource}}
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

# Audit: {{title}}

## Event Details

- **Type**: {{audit_type}}
- **Severity**: {{severity}}
{{#user}}
- **User**: {{user}}
{{/user}}
{{#action}}
- **Action**: {{action}}
{{/action}}
{{#resource}}
- **Resource**: {{resource}}
{{/resource}}

## Context

{{context}}

{{#impact}}
## Impact Assessment

{{impact}}
{{/impact}}

{{#evidence}}
## Evidence

{{evidence}}
{{/evidence}}

{{#recommended_actions}}
## Recommended Actions

{{recommended_actions}}
{{/recommended_actions}}
