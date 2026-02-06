# Infrastructure Specification Standards

## Required Conventions

### 1. Objective
- ALWAYS state the infrastructure change clearly and its motivation
- Include the expected outcome and success metrics
- Reference the triggering event (scaling need, incident, new service, etc.)

### 2. Current State
- ALWAYS document the existing infrastructure configuration
- Include relevant diagrams, resource counts, or architecture references
- Specify the baseline metrics (current capacity, cost, performance)

### 3. Proposed Changes
- ALWAYS write changes as checkable items (- [ ] format)
- Specify exact resources being added, modified, or removed
- Include configuration values (instance types, region, sizing, etc.)

### 4. Security Considerations
- ALWAYS document security implications of the change
- Address network access, IAM permissions, encryption, and secrets management
- Include any compliance requirements (SOC2, HIPAA, GDPR, etc.)

### 5. Rollback Plan
- ALWAYS document step-by-step rollback procedure
- Specify the rollback trigger criteria (what failure conditions warrant rollback)
- Include estimated rollback time
- NEVER deploy infrastructure changes without a rollback plan

### 6. Verification
- ALWAYS include verification steps as checkable items
- Include health checks, smoke tests, and monitoring confirmation
- Specify who needs to verify (ops team, security team, etc.)

## Optional Section Guidelines

### Monitoring & Alerts
- Include for any change that affects system observability
- Document new dashboards, alerts, or metrics
- Specify alert thresholds and escalation paths

### Cost Impact
- Include for changes that affect cloud spend
- Document expected monthly cost change (before → after)
- Include cost optimization considerations

### Capacity Planning
- Include for scaling-related changes
- Document expected growth and headroom
- Specify auto-scaling policies if applicable

## Best Practices

- Test infrastructure changes in a staging environment first
- Include terraform/IaC references when applicable
- Document the maintenance window if downtime is required
- Keep rollback plans tested and up to date
