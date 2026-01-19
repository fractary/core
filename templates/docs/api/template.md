# {{title}}

## Overview

{{description}}

## Endpoints

{{#endpoints}}
### {{method}} {{path}}

{{description}}

#### Request

{{#request_body}}
**Body:**
```json
{{request_body}}
```
{{/request_body}}

{{#parameters}}
**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
{{#parameters}}
| {{name}} | {{type}} | {{required}} | {{description}} |
{{/parameters}}
{{/parameters}}

#### Response

```json
{{response}}
```

{{/endpoints}}

## Authentication

{{authentication}}

## Error Codes

| Code | Description |
|------|-------------|
{{#error_codes}}
| {{code}} | {{description}} |
{{/error_codes}}

## Examples

{{#examples}}
### {{title}}

```{{language}}
{{code}}
```

{{/examples}}
