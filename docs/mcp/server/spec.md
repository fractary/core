# Spec Toolset - MCP Tools Reference

MCP tools reference for the Spec toolset. Tools for technical specification management.

## Tool Naming Convention

```
fractary_spec_{action}
```

## Specification Tools

### fractary_spec_create

Create a new specification.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | Yes | Specification title |
| `workId` | string | No | Associated work item ID |
| `workType` | string | No | Work type: `feature`, `bug`, `infrastructure`, `api` |
| `template` | string | No | Template: `basic`, `feature`, `bug`, `infrastructure`, `api` |

**Example:**
```json
{
  "title": "API Authentication Design",
  "workType": "feature",
  "template": "api",
  "workId": "123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "SPEC-20240115",
    "title": "API Authentication Design",
    "path": "specs/SPEC-20240115-api-authentication-design.md",
    "template": "api",
    "status": "draft"
  }
}
```

### fractary_spec_get

Get a specification by ID.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `specId` | string | Yes | Specification ID or path |

**Example:**
```json
{
  "specId": "SPEC-20240115"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "SPEC-20240115",
    "title": "API Authentication Design",
    "content": "# API Authentication Design\n\n## Problem Statement\n...",
    "metadata": {
      "author": "developer1",
      "status": "draft",
      "version": "1.0"
    }
  }
}
```

### fractary_spec_update

Update a specification.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `specId` | string | Yes | Specification ID or path |
| `title` | string | No | New title |
| `content` | string | No | New content |
| `status` | string | No | Status: `draft`, `review`, `approved`, `archived` |

**Example:**
```json
{
  "specId": "SPEC-20240115",
  "status": "review"
}
```

### fractary_spec_delete

Delete a specification.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `specId` | string | Yes | Specification ID or path |

### fractary_spec_list

List specifications.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workType` | string | No | Filter by work type |
| `status` | string | No | Filter by status |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "SPEC-20240115",
      "title": "API Authentication Design",
      "workType": "feature",
      "status": "draft"
    },
    {
      "id": "SPEC-20240110",
      "title": "Database Migration",
      "workType": "infrastructure",
      "status": "approved"
    }
  ]
}
```

## Validation Tools

### fractary_spec_validate

Validate a specification.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `specId` | string | Yes | Specification ID or path |

**Example:**
```json
{
  "specId": "SPEC-20240115"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "partial",
    "score": 75,
    "checks": [
      { "name": "has_title", "passed": true, "message": "Title present" },
      { "name": "has_problem_statement", "passed": true, "message": "Problem statement present" },
      { "name": "has_acceptance_criteria", "passed": false, "message": "Missing acceptance criteria" }
    ],
    "suggestions": [
      "Add specific acceptance criteria with measurable outcomes",
      "Consider adding rollout plan section"
    ]
  }
}
```

## Refinement Tools

### fractary_spec_refine

Get refinement questions for a specification.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `specId` | string | Yes | Specification ID or path |

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "category": "acceptance",
        "question": "What are the specific acceptance criteria?",
        "context": "The spec describes the feature but lacks measurable outcomes.",
        "priority": "high"
      },
      {
        "category": "error_handling",
        "question": "What error handling is required?",
        "context": "The API design doesn't specify error response formats.",
        "priority": "high"
      }
    ]
  }
}
```

## Archive Tools

### fractary_spec_archive

Archive a completed specification.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `specId` | string | Yes | Specification ID or path |
| `reason` | string | No | Archive reason |

**Example:**
```json
{
  "specId": "SPEC-20240115",
  "reason": "Feature completed and released"
}
```

## Tool Summary

| Tool | Description |
|------|-------------|
| `fractary_spec_create` | Create a specification |
| `fractary_spec_get` | Get a specification |
| `fractary_spec_update` | Update a specification |
| `fractary_spec_delete` | Delete a specification |
| `fractary_spec_list` | List specifications |
| `fractary_spec_validate` | Validate a specification |
| `fractary_spec_refine` | Get refinement questions |
| `fractary_spec_archive` | Archive a specification |

## Error Responses

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Specification SPEC-INVALID not found"
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `NOT_FOUND` | Specification not found |
| `VALIDATION_ERROR` | Invalid parameters |
| `ALREADY_EXISTS` | Specification ID already exists |
| `TEMPLATE_NOT_FOUND` | Template not found |

## Other Interfaces

- **SDK:** [Spec API](/docs/sdk/js/spec.md)
- **CLI:** [Spec Commands](/docs/cli/spec.md)
- **Plugin:** [Spec Plugin](/docs/plugins/spec.md)
