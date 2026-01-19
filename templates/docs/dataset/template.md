# {{title}}

## Overview

{{description}}

## Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
{{#fields}}
| {{name}} | {{type}} | {{required}} | {{description}} |
{{/fields}}

## Relationships

{{#relationships}}
### {{name}}

- **Type:** {{type}}
- **Target:** {{target}}
- **Description:** {{description}}
{{/relationships}}

## Indexes

{{#indexes}}
| Name | Fields | Type |
|------|--------|------|
{{#indexes}}
| {{name}} | {{fields}} | {{type}} |
{{/indexes}}
{{/indexes}}

## Data Sources

{{#sources}}
- **{{name}}**: {{description}}
{{/sources}}

## Data Quality

### Validation Rules

{{#validation_rules}}
- {{.}}
{{/validation_rules}}

### Constraints

{{#constraints}}
- {{.}}
{{/constraints}}

## Sample Data

```json
{{sample_data}}
```

## Related Datasets

{{#related}}
- [{{name}}]({{path}})
{{/related}}
