# Operational Log Standards

## Required Conventions

### 1. Event Identification
- ALWAYS include unique event_id
- ALWAYS specify affected service
- ALWAYS include detection timestamp

### 2. Classification
- ALWAYS set appropriate severity (info, warning, error, critical)
- ALWAYS categorize event (health, alert, maintenance, incident)
- ALWAYS specify environment (dev, staging, prod)

### 3. Impact Assessment
- ALWAYS document user and system impact
- ALWAYS note scope of impact (partial, full outage)
- ALWAYS estimate number of affected users if applicable

### 4. Response Documentation
- ALWAYS document actions taken
- ALWAYS include timestamps for response actions
- ALWAYS note who responded

## Best Practices

- Use unique event_id format: `OP-{timestamp}-{random}`
- Link to monitoring dashboards and alerts
- Include relevant metrics and graphs
- Track MTTR (Mean Time to Recovery) for incidents
- Document post-incident action items
- Escalate critical events immediately
- Create postmortem documents for major incidents
- Keep production incident logs for compliance
