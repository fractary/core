---
log_type: deployment
title: {{title}}
deployment_id: {{deployment_id}}
date: {{date}}
status: {{status}}
environment: {{environment}}
{{#version}}
version: {{version}}
{{/version}}
{{#commit_sha}}
commit_sha: {{commit_sha}}
{{/commit_sha}}
{{#deployment_tool}}
deployment_tool: {{deployment_tool}}
{{/deployment_tool}}
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

# Deployment: {{title}}

## Configuration

- **Environment**: {{environment}}
{{#version}}
- **Version**: {{version}}
{{/version}}
{{#commit_sha}}
- **Commit**: {{commit_sha}}
{{/commit_sha}}
{{#deployment_tool}}
- **Tool**: {{deployment_tool}}
{{/deployment_tool}}

## Deployment Steps

{{#deployment_steps}}
1. {{.}}
{{/deployment_steps}}

{{#verification}}
## Verification

{{#verification_checks}}
- [ ] {{.}}
{{/verification_checks}}
{{/verification}}

{{#summary}}
## Summary

{{summary}}
{{/summary}}
