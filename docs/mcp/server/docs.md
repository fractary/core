# Docs Toolset - MCP Tools Reference

MCP tools reference for the Docs toolset. Tools for documentation management.

## Tool Naming Convention

```
fractary_docs_{action}
```

## Document Tools

### fractary_docs_create

Create a new document.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Document identifier |
| `content` | string | Yes | Document content |
| `title` | string | Yes | Document title |
| `format` | string | No | Format: `markdown`, `html`, `text` |
| `type` | string | No | Type: `adr`, `api`, `guide`, `readme` |
| `tags` | string[] | No | Tags |
| `author` | string | No | Author name |

**Example:**
```json
{
  "id": "user-guide",
  "content": "# User Guide\n\nWelcome to the application...",
  "title": "User Guide",
  "format": "markdown",
  "tags": ["guide", "user"],
  "author": "developer1"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-guide",
    "title": "User Guide",
    "path": "docs/guides/user-guide.md",
    "format": "markdown"
  }
}
```

### fractary_docs_get

Get a document by ID.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Document ID |

**Example:**
```json
{
  "id": "user-guide"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-guide",
    "title": "User Guide",
    "content": "# User Guide\n\nWelcome...",
    "format": "markdown",
    "metadata": {
      "tags": ["guide", "user"],
      "author": "developer1",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  }
}
```

### fractary_docs_update

Update a document.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Document ID |
| `content` | string | No | New content |
| `title` | string | No | New title |
| `status` | string | No | Status: `draft`, `review`, `published`, `archived` |
| `addTags` | string[] | No | Tags to add |
| `removeTags` | string[] | No | Tags to remove |

**Example:**
```json
{
  "id": "user-guide",
  "status": "published",
  "addTags": ["v1.0"]
}
```

### fractary_docs_delete

Delete a document.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Document ID |

### fractary_docs_list

List documents.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | No | Filter by type |
| `tags` | string[] | No | Filter by tags |
| `author` | string | No | Filter by author |
| `status` | string | No | Filter by status |

**Example:**
```json
{
  "type": "guide",
  "status": "published"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-guide",
      "title": "User Guide",
      "type": "guide",
      "status": "published",
      "updatedAt": "2024-01-15T10:00:00Z"
    },
    {
      "id": "getting-started",
      "title": "Getting Started",
      "type": "guide",
      "status": "published",
      "updatedAt": "2024-01-10T08:00:00Z"
    }
  ]
}
```

## Search Tools

### fractary_docs_search

Search documents.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query |
| `type` | string | No | Filter by type |
| `tags` | string[] | No | Filter by tags |

**Example:**
```json
{
  "query": "authentication",
  "type": "api"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "api-auth",
      "title": "Authentication API",
      "excerpt": "...implements JWT authentication for secure access...",
      "score": 0.95
    }
  ]
}
```

## Validation Tools

### fractary_docs_validate

Validate a document.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Document ID |

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "errors": [],
    "warnings": [
      {
        "code": "MISSING_DESCRIPTION",
        "message": "Consider adding a description for better discoverability"
      }
    ]
  }
}
```

### fractary_docs_validate_all

Validate all documents.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | No | Validate specific type |

## Audit Tools

### fractary_docs_audit

Audit documentation quality.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `report` | string | No | Report type: `summary`, `gaps`, `quality`, `full` |

**Example:**
```json
{
  "report": "gaps"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "missing": [
      { "path": "src/auth/", "reason": "No README" },
      { "path": "src/api/handlers/", "reason": "No documentation" }
    ],
    "incomplete": [
      { "id": "api-auth", "reason": "Missing error handling section" }
    ],
    "recommendations": [
      "Add README to src/auth/",
      "Document API handlers"
    ]
  }
}
```

### fractary_docs_check_consistency

Check documentation consistency with code.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sourceDir` | string | No | Source directory to check |
| `types` | string[] | No | Document types to check |

**Response:**
```json
{
  "success": true,
  "data": {
    "upToDate": 8,
    "outdated": [
      {
        "id": "api-auth",
        "issues": [
          "Function 'authenticate()' signature changed",
          "New parameter 'refreshToken' not documented"
        ]
      }
    ],
    "missing": 1
  }
}
```

## Export Tools

### fractary_docs_export

Export a document to another format.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Document ID |
| `format` | string | Yes | Target format: `html`, `pdf`, `text` |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-guide",
    "format": "html",
    "content": "<html>..."
  }
}
```

## Tool Summary

| Tool | Description |
|------|-------------|
| `fractary_docs_create` | Create a document |
| `fractary_docs_get` | Get a document |
| `fractary_docs_update` | Update a document |
| `fractary_docs_delete` | Delete a document |
| `fractary_docs_list` | List documents |
| `fractary_docs_search` | Search documents |
| `fractary_docs_validate` | Validate a document |
| `fractary_docs_validate_all` | Validate all documents |
| `fractary_docs_audit` | Audit documentation |
| `fractary_docs_check_consistency` | Check code consistency |
| `fractary_docs_export` | Export document |

## Other Interfaces

- **SDK:** [Docs API](/docs/sdk/js/docs.md)
- **CLI:** [Docs Commands](/docs/cli/docs.md)
- **Plugin:** [Docs Plugin](/docs/plugins/docs.md)
