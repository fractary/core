---
title: "{{title}}"
fractary_doc_type: spec-api
status: {{status}}
date: {{date}}
{{#work_id}}
work_id: "{{work_id}}"
{{/work_id}}
{{#work_type}}
work_type: {{work_type}}
{{/work_type}}
source: {{source}}
validation_status: not_validated
tags: []
---

# {{title}}

## Overview

{{overview}}

## Authentication

{{authentication}}

## Endpoints

{{#endpoints}}
### `{{method}} {{path}}`

**Description:** {{description}}

**Parameters:**

{{#parameters}}
- `{{name}}` ({{type}}, {{required}}): {{description}}
{{/parameters}}

**Request Body:**

```json
{{request_body}}
```

**Response:**

```json
{{response_body}}
```

{{/endpoints}}

{{#data_models}}
## Data Models

{{data_models}}
{{/data_models}}

## Error Handling

| Code | Message | Description |
|------|---------|-------------|
{{#errors}}
| {{code}} | {{message}} | {{description}} |
{{/errors}}

{{#rate_limiting}}
## Rate Limiting

{{rate_limiting}}
{{/rate_limiting}}

{{#versioning}}
## Versioning

{{versioning}}
{{/versioning}}

## Testing

{{#test_scenarios}}
- [ ] {{.}}
{{/test_scenarios}}

{{#security_considerations}}
## Security Considerations

{{security_considerations}}
{{/security_considerations}}

{{#migration_guide}}
## Migration Guide

{{migration_guide}}
{{/migration_guide}}
