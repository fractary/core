# Work Toolset - MCP Tools Reference

MCP tools reference for the Work toolset. 19 tools for work tracking across GitHub Issues, Jira, and Linear.

## Tool Naming Convention

```
fractary_work_{resource}_{action}
```

## Issue Tools

### fractary_work_issue_create

Create a new issue.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | Yes | Issue title |
| `body` | string | No | Issue description |
| `workType` | string | No | Work type: `feature`, `bug`, `chore`, `patch`, `infrastructure`, `api` |
| `labels` | string[] | No | Labels to apply |
| `assignees` | string[] | No | Users to assign |
| `milestone` | string | No | Milestone name |

**Example:**
```json
{
  "title": "Add user authentication",
  "body": "Implement JWT-based authentication",
  "workType": "feature",
  "labels": ["enhancement", "priority:high"],
  "assignees": ["developer1"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "number": 123,
    "title": "Add user authentication",
    "state": "open",
    "url": "https://github.com/myorg/myrepo/issues/123"
  }
}
```

### fractary_work_issue_fetch

Fetch an issue by number or ID.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issueId` | string \| number | Yes | Issue number or ID |

**Example:**
```json
{
  "issueId": 123
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "number": 123,
    "title": "Add user authentication",
    "body": "Implement JWT-based authentication",
    "state": "open",
    "labels": [{"name": "enhancement"}],
    "assignees": ["developer1"],
    "url": "https://github.com/myorg/myrepo/issues/123"
  }
}
```

### fractary_work_issue_update

Update an existing issue.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issueId` | string \| number | Yes | Issue number or ID |
| `title` | string | No | New title |
| `body` | string | No | New description |
| `state` | string | No | New state: `open`, `closed` |

**Example:**
```json
{
  "issueId": 123,
  "state": "closed"
}
```

### fractary_work_issue_list

List issues with optional filters.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `state` | string | No | Filter: `open`, `closed`, `all` |
| `labels` | string[] | No | Filter by labels |
| `assignee` | string | No | Filter by assignee |
| `limit` | number | No | Maximum results |

**Example:**
```json
{
  "state": "open",
  "labels": ["bug"]
}
```

### fractary_work_issue_search

Search issues.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query |
| `state` | string | No | Filter: `open`, `closed`, `all` |
| `labels` | string[] | No | Filter by labels |

**Example:**
```json
{
  "query": "authentication",
  "state": "open"
}
```

## Comment Tools

### fractary_work_comment_create

Add a comment to an issue.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issueId` | string \| number | Yes | Issue number or ID |
| `body` | string | Yes | Comment text |
| `faberContext` | string | No | FABER phase context |

**Example:**
```json
{
  "issueId": 123,
  "body": "Investigation complete, root cause identified",
  "faberContext": "architect"
}
```

### fractary_work_comment_list

List comments on an issue.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issueId` | string \| number | Yes | Issue number or ID |
| `limit` | number | No | Maximum results |

## Label Tools

### fractary_work_label_add

Add labels to an issue.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issueId` | string \| number | Yes | Issue number or ID |
| `labels` | string[] | Yes | Labels to add |

**Example:**
```json
{
  "issueId": 123,
  "labels": ["bug", "priority:high"]
}
```

### fractary_work_label_remove

Remove labels from an issue.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issueId` | string \| number | Yes | Issue number or ID |
| `labels` | string[] | Yes | Labels to remove |

### fractary_work_label_set

Replace all labels on an issue.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issueId` | string \| number | Yes | Issue number or ID |
| `labels` | string[] | Yes | Labels to set |

### fractary_work_label_list

List labels.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issueId` | string \| number | No | Issue to list labels for; if omitted, lists all repo labels |

## Milestone Tools

### fractary_work_milestone_create

Create a milestone.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | Yes | Milestone title |
| `description` | string | No | Milestone description |
| `dueDate` | string | No | Due date (ISO 8601) |

**Example:**
```json
{
  "title": "v1.0.0",
  "description": "Initial release",
  "dueDate": "2024-03-01"
}
```

### fractary_work_milestone_set

Set milestone on an issue.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issueId` | string \| number | Yes | Issue number or ID |
| `milestone` | string | Yes | Milestone name |

### fractary_work_milestone_remove

Remove milestone from an issue.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issueId` | string \| number | Yes | Issue number or ID |

### fractary_work_milestone_list

List milestones.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `state` | string | No | Filter: `open`, `closed`, `all` |

## Tool Summary

| Tool | Description |
|------|-------------|
| `fractary_work_issue_create` | Create a new issue |
| `fractary_work_issue_fetch` | Fetch an issue |
| `fractary_work_issue_update` | Update an issue |
| `fractary_work_issue_list` | List issues |
| `fractary_work_issue_search` | Search issues |
| `fractary_work_comment_create` | Add a comment |
| `fractary_work_comment_list` | List comments |
| `fractary_work_label_add` | Add labels |
| `fractary_work_label_remove` | Remove labels |
| `fractary_work_label_set` | Set labels |
| `fractary_work_label_list` | List labels |
| `fractary_work_milestone_create` | Create milestone |
| `fractary_work_milestone_set` | Set milestone |
| `fractary_work_milestone_remove` | Remove milestone |
| `fractary_work_milestone_list` | List milestones |

## Error Responses

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Issue #999 not found"
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `NOT_FOUND` | Issue or resource not found |
| `UNAUTHORIZED` | Authentication failed |
| `FORBIDDEN` | Insufficient permissions |
| `VALIDATION_ERROR` | Invalid parameters |
| `RATE_LIMITED` | API rate limit exceeded |

## Other Interfaces

- **SDK:** [Work API](/docs/sdk/work.md)
- **CLI:** [Work Commands](/docs/cli/work.md)
- **Plugin:** [Work Plugin](/docs/plugins/work.md)
