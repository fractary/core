# API Specification Standards

## Required Conventions

### 1. Overview
- ALWAYS describe the API's purpose and target consumers
- ALWAYS specify the base URL and API version
- Include any prerequisite knowledge or dependencies

### 2. Endpoints
- ALWAYS document each endpoint with method, path, and description
- ALWAYS include request parameters with types and required/optional status
- ALWAYS include request body and response body examples as JSON
- ALWAYS document all possible HTTP status codes per endpoint

### 3. Authentication
- ALWAYS specify the authentication mechanism (Bearer token, API key, OAuth, etc.)
- Document how to obtain credentials
- Include example headers

### 4. Error Handling
- ALWAYS document error response format
- ALWAYS include a table of all error codes with descriptions
- Include example error responses for common failure scenarios

### 5. Testing
- ALWAYS include test scenarios as checkable items
- Cover happy paths, error paths, and edge cases
- Include contract testing scenarios for API compatibility

## Optional Section Guidelines

### Rate Limiting
- Include for public-facing or multi-tenant APIs
- Document rate limit headers and behavior when exceeded
- Specify per-endpoint limits if they differ

### Versioning
- Include when introducing breaking changes
- Document the versioning strategy (URL path, header, query param)
- Describe deprecation timelines for old versions

### Data Models
- Include for complex or shared data structures
- Document field types, constraints, and relationships
- Include validation rules

## Best Practices

- Use consistent naming conventions (camelCase, snake_case) across all endpoints
- Document idempotency behavior for write operations
- Include pagination details for list endpoints
- Specify content types (application/json, multipart/form-data, etc.)
