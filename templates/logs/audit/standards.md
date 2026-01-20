# Audit Log Standards

## Required Conventions

### 1. Immutability
- NEVER modify existing audit log entries
- ALWAYS create new entries for updates or corrections
- ALWAYS preserve original timestamps

### 2. Completeness
- ALWAYS include user/actor who performed the action
- ALWAYS include the action performed
- ALWAYS include the resource affected
- ALWAYS include timestamps in ISO 8601 format

### 3. Classification
- ALWAYS set appropriate audit_type (security, compliance, performance, access, change)
- ALWAYS set severity level (info, warning, critical)
- ALWAYS escalate critical events immediately

### 4. Evidence
- ALWAYS include supporting evidence for critical events
- ALWAYS reference related logs or tickets
- ALWAYS document the source of the event

## Best Practices

- Use unique audit_id format: `AUDIT-{timestamp}-{random}`
- Include IP addresses and session info for access events
- Link to related compliance requirements
- Set appropriate retention based on severity (critical = forever)
- Review audit logs periodically for patterns
- Never log sensitive data (passwords, tokens) in plain text
