---
log_type: operational
title: {{title}}
event_id: {{event_id}}
date: {{date}}
status: {{status}}
service: {{service}}
{{#severity}}
severity: {{severity}}
{{/severity}}
{{#category}}
category: {{category}}
{{/category}}
{{#environment}}
environment: {{environment}}
{{/environment}}
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

# Operational Event: {{title}}

## Event Details

- **Service**: {{service}}
{{#severity}}
- **Severity**: {{severity}}
{{/severity}}
{{#category}}
- **Category**: {{category}}
{{/category}}
- **Detected**: {{date}}

## Description

{{description}}

{{#impact}}
## Impact

{{impact}}
{{/impact}}

{{#response_actions}}
## Response Actions

{{#response_actions}}
1. {{.}}
{{/response_actions}}
{{/response_actions}}

{{#resolution}}
## Resolution

{{resolution}}
{{/resolution}}

{{#follow_up}}
## Follow-up

{{#follow_up}}
- {{.}}
{{/follow_up}}
{{/follow_up}}
