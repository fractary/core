# {{title}}

## Overview

{{overview}}

## Architecture Diagram

{{#diagram}}
```mermaid
{{diagram}}
```
{{/diagram}}

## Components

{{#components}}
### {{name}}

**Purpose:** {{purpose}}

**Responsibilities:**
{{#responsibilities}}
- {{.}}
{{/responsibilities}}

**Dependencies:**
{{#dependencies}}
- {{.}}
{{/dependencies}}

{{/components}}

## Data Flow

{{data_flow}}

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
{{#tech_stack}}
| {{layer}} | {{technology}} | {{purpose}} |
{{/tech_stack}}

## Security Considerations

{{security}}

## Scalability

{{scalability}}

## Related Documents

{{#related}}
- [{{title}}]({{path}})
{{/related}}
