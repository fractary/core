# Workflow Log Standards

## Required Conventions

### 1. Identification
- ALWAYS use workflow-{id} format for workflow_id
- ALWAYS specify workflow type (faber, etl, cicd, data-pipeline, custom)
- ALWAYS link to work item when applicable

### 2. Phase Tracking
- ALWAYS track current FABER phase for faber workflows
- ALWAYS record phase transitions
- ALWAYS timestamp all operations

### 3. Operation Logging
- ALWAYS log operations with timestamps
- ALWAYS include operation duration
- ALWAYS track operation status

### 4. Decision Documentation
- ALWAYS document key decisions
- ALWAYS include decision rationale
- ALWAYS note alternatives considered

## Best Practices

- Use unique workflow_id format: `workflow-{timestamp}-{random}`
- Track dependencies between workflows
- Include context (project, repo, branch)
- Record all artifacts created
- Calculate and display metrics
- Document next steps for continuation
- Link related workflow logs
- Archive completed workflows with metrics summary
- Use partial status for workflows that partially succeed
