---
log_type: debug
title: {{title}}
debug_id: {{debug_id}}
date: {{date}}
status: {{status}}
{{#issue_number}}
issue_number: {{issue_number}}
{{/issue_number}}
{{#component}}
component: {{component}}
{{/component}}
{{#severity}}
severity: {{severity}}
{{/severity}}
{{#repository}}
repository: {{repository}}
{{/repository}}
{{#branch}}
branch: {{branch}}
{{/branch}}
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

# Debug: {{title}}

## Problem Description

{{problem_description}}

## Investigation Steps

{{#investigation_steps}}
1. {{.}}
{{/investigation_steps}}

{{#findings}}
## Findings

{{#findings}}
- {{.}}
{{/findings}}
{{/findings}}

{{#root_cause}}
## Root Cause

{{root_cause}}
{{/root_cause}}

{{#resolution}}
## Resolution

{{resolution}}
{{/resolution}}
