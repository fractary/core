---
log_type: workflow
title: {{title}}
workflow_id: {{workflow_id}}
timestamp: {{timestamp}}
status: {{status}}
{{#work_item_id}}
work_item_id: {{work_item_id}}
{{/work_item_id}}
{{#phase}}
phase: {{phase}}
{{/phase}}
{{#workflow_type}}
workflow_type: {{workflow_type}}
{{/workflow_type}}
{{#context}}
context:
{{#context.project}}
  project: {{context.project}}
{{/context.project}}
{{#context.repository}}
  repository: {{context.repository}}
{{/context.repository}}
{{#context.branch}}
  branch: {{context.branch}}
{{/context.branch}}
{{/context}}
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

# Workflow: {{title}}

{{#phase}}
## Current Phase: {{phase}}
{{/phase}}

## Operations

| Timestamp | Phase | Operation | Status | Duration |
|-----------|-------|-----------|--------|----------|
{{#operations}}
| {{timestamp}} | {{phase}} | {{operation}} | {{status}} | {{duration}}ms |
{{/operations}}

{{#decisions}}
## Decisions

{{#decisions}}
### {{title}}

- **Rationale**: {{rationale}}
{{#alternatives}}
- **Alternatives**: {{alternatives}}
{{/alternatives}}

{{/decisions}}
{{/decisions}}

{{#artifacts}}
## Artifacts

{{#artifacts}}
- {{.}}
{{/artifacts}}
{{/artifacts}}

{{#metrics}}
## Metrics

{{#total_duration}}
- **Duration**: {{total_duration}}
{{/total_duration}}
{{#operation_count}}
- **Operations**: {{operation_count}}
{{/operation_count}}
{{#success_rate}}
- **Success Rate**: {{success_rate}}%
{{/success_rate}}
{{/metrics}}

{{#next_steps}}
## Next Steps

{{#next_steps}}
- {{.}}
{{/next_steps}}
{{/next_steps}}
