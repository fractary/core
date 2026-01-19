# {{title}}

## Overview

{{description}}

## Pipeline Diagram

```mermaid
{{diagram}}
```

## Sources

{{#sources}}
### {{name}}

- **Type:** {{type}}
- **Connection:** {{connection}}
- **Schedule:** {{schedule}}
- **Description:** {{description}}
{{/sources}}

## Transformations

{{#transformations}}
### {{name}}

**Input:** {{input}}
**Output:** {{output}}

{{description}}

```{{language}}
{{code}}
```
{{/transformations}}

## Destinations

{{#destinations}}
### {{name}}

- **Type:** {{type}}
- **Connection:** {{connection}}
- **Mode:** {{mode}}
{{/destinations}}

## Schedule

- **Frequency:** {{schedule.frequency}}
- **Timezone:** {{schedule.timezone}}
- **Dependencies:** {{schedule.dependencies}}

## Monitoring

### Alerts

{{#alerts}}
- **{{name}}**: {{condition}} → {{action}}
{{/alerts}}

### Metrics

{{#metrics}}
- {{name}}: {{description}}
{{/metrics}}

## Error Handling

{{error_handling}}

## Related Pipelines

{{#related}}
- [{{name}}]({{path}})
{{/related}}
