---
log_type: session
title: {{title}}
session_id: {{session_id}}
date: {{date}}
status: {{status}}
{{#conversation_id}}
conversation_id: {{conversation_id}}
{{/conversation_id}}
{{#repository}}
repository: {{repository}}
{{/repository}}
{{#branch}}
branch: {{branch}}
{{/branch}}
{{#model}}
model: {{model}}
{{/model}}
{{#token_count}}
token_count: {{token_count}}
{{/token_count}}
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

# Session: {{title}}

## Metadata

- **Started**: {{date}}
{{#model}}
- **Model**: {{model}}
{{/model}}
{{#repository}}
- **Repository**: {{repository}}
{{/repository}}
{{#branch}}
- **Branch**: {{branch}}
{{/branch}}
{{#token_count}}
- **Tokens**: {{token_count}}
{{/token_count}}
{{#duration_seconds}}
- **Duration**: {{duration_seconds}}s
{{/duration_seconds}}

## Conversation

{{conversation}}

{{#summary}}
## Summary

{{summary}}
{{/summary}}

{{#decisions}}
## Decisions

{{#decisions}}
- {{.}}
{{/decisions}}
{{/decisions}}

{{#follow_ups}}
## Follow-ups

{{#follow_ups}}
- {{.}}
{{/follow_ups}}
{{/follow_ups}}
