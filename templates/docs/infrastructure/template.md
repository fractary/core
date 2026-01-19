# {{title}}

## Overview

{{overview}}

## Architecture

```mermaid
{{diagram}}
```

## Resources

{{#resources}}
### {{name}}

- **Type:** {{type}}
- **Provider:** {{provider}}
- **Region:** {{region}}
- **Configuration:** {{configuration}}
{{/resources}}

## Networking

{{networking}}

## Security

### Access Control

{{access_control}}

### Secrets Management

{{secrets_management}}

## Deployment

### Prerequisites

{{#deployment_prerequisites}}
- {{.}}
{{/deployment_prerequisites}}

### Process

{{deployment_process}}

### Rollback

{{rollback}}

## Monitoring

### Health Checks

{{#health_checks}}
- **{{name}}**: {{endpoint}} ({{interval}})
{{/health_checks}}

### Alerts

{{#alerts}}
- **{{name}}**: {{condition}} → {{action}}
{{/alerts}}

## Runbook

### Common Operations

{{#operations}}
#### {{name}}

{{description}}

```bash
{{command}}
```
{{/operations}}

### Incident Response

{{incident_response}}

## Related

{{#related}}
- [{{title}}]({{path}})
{{/related}}
