# Logs Toolset - MCP Tools Reference

MCP tools reference for the Logs toolset. Tools for session and operational logging.

## Tool Naming Convention

```
fractary_logs_{action}
```

## Log Tools

### fractary_logs_write

Write a new log entry.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | Log type: `session`, `build`, `deployment`, `test`, `debug`, `audit`, `operational`, `workflow` |
| `title` | string | Yes | Log title |
| `content` | string | Yes | Log content |
| `issueNumber` | number | No | Associated issue number |
| `metadata` | object | No | Additional metadata |

**Example:**
```json
{
  "type": "session",
  "title": "Feature Development Session",
  "content": "Session transcript...",
  "issueNumber": 123
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "LOG-20240115-001",
    "type": "session",
    "title": "Feature Development Session",
    "path": ".fractary/logs/session/LOG-20240115-001.md"
  }
}
```

### fractary_logs_read

Read a log entry.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `logId` | string | Yes | Log ID or path |

**Example:**
```json
{
  "logId": "LOG-20240115-001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "LOG-20240115-001",
    "type": "session",
    "title": "Feature Development Session",
    "content": "Session transcript...",
    "metadata": {
      "issueNumber": 123,
      "duration": 3600
    }
  }
}
```

### fractary_logs_list

List log entries.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | No | Filter by log type |
| `issueNumber` | number | No | Filter by issue |
| `since` | string | No | Logs since date (ISO 8601) |
| `until` | string | No | Logs until date |
| `limit` | number | No | Maximum results |

**Example:**
```json
{
  "type": "session",
  "issueNumber": 123
}
```

### fractary_logs_search

Search logs.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query |
| `type` | string | No | Filter by log type |
| `issueNumber` | number | No | Filter by issue |
| `since` | string | No | Start date |
| `until` | string | No | End date |

**Example:**
```json
{
  "query": "authentication error",
  "type": "session"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "logId": "LOG-20240115-001",
      "title": "Feature Development Session",
      "matches": [
        {
          "line": 45,
          "content": "Encountered authentication error during login",
          "context": "...attempting to login with invalid token..."
        }
      ],
      "score": 0.95
    }
  ]
}
```

## Capture Tools

### fractary_logs_capture_start

Start session capture.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issueNumber` | number | No | Associated issue |
| `title` | string | No | Session title |
| `redactSensitive` | boolean | No | Redact sensitive data |
| `model` | string | No | AI model being used |

**Example:**
```json
{
  "issueNumber": 123,
  "redactSensitive": true,
  "model": "claude-3.5-sonnet"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "SESSION-20240115-001",
    "status": "started",
    "startedAt": "2024-01-15T10:30:00Z"
  }
}
```

### fractary_logs_capture_stop

Stop active session capture.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `summary` | string | No | Session summary |

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "SESSION-20240115-001",
    "status": "completed",
    "path": ".fractary/logs/session/SESSION-20240115-001.md",
    "duration": 3600,
    "startedAt": "2024-01-15T10:30:00Z",
    "completedAt": "2024-01-15T11:30:00Z"
  }
}
```

### fractary_logs_capture_status

Get capture status.

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "active": true,
    "sessionId": "SESSION-20240115-001",
    "issueNumber": 123,
    "startedAt": "2024-01-15T10:30:00Z",
    "duration": 1800
  }
}
```

## Archive Tools

### fractary_logs_archive

Archive logs.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issueNumber` | number | No | Archive logs for issue |
| `olderThan` | number | No | Archive logs older than days |
| `type` | string | No | Archive specific type |

**Example:**
```json
{
  "issueNumber": 123
}
```

## Cleanup Tools

### fractary_logs_cleanup

Clean up old logs.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `olderThan` | number | No | Delete logs older than days |
| `type` | string | No | Clean specific type |
| `dryRun` | boolean | No | Preview without deleting |

**Example:**
```json
{
  "olderThan": 90,
  "dryRun": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "dryRun": true,
    "count": 15,
    "size": "2.3 MB",
    "logs": [
      { "id": "LOG-20231015-001", "type": "session" },
      { "id": "LOG-20231020-003", "type": "build" }
    ]
  }
}
```

## Analyze Tools

### fractary_logs_analyze

Analyze logs for patterns.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | No | Log type to analyze |
| `issueNumber` | number | No | Analyze logs for issue |
| `since` | string | No | Start date |
| `report` | string | No | Report type: `summary`, `errors`, `time`, `full` |

**Example:**
```json
{
  "issueNumber": 123,
  "report": "time"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "issueNumber": 123,
    "totalSessions": 5,
    "totalDuration": 31500,
    "byPhase": {
      "frame": 2700,
      "architect": 5400,
      "build": 18900,
      "evaluate": 4500
    },
    "byDate": {
      "2024-01-10": 9000,
      "2024-01-11": 13500,
      "2024-01-12": 9000
    }
  }
}
```

## Tool Summary

| Tool | Description |
|------|-------------|
| `fractary_logs_write` | Write a log entry |
| `fractary_logs_read` | Read a log entry |
| `fractary_logs_list` | List log entries |
| `fractary_logs_search` | Search logs |
| `fractary_logs_capture_start` | Start session capture |
| `fractary_logs_capture_stop` | Stop session capture |
| `fractary_logs_capture_status` | Get capture status |
| `fractary_logs_archive` | Archive logs |
| `fractary_logs_cleanup` | Clean up old logs |
| `fractary_logs_analyze` | Analyze logs |

## Other Interfaces

- **SDK:** [Logs API](/docs/sdk/logs.md)
- **CLI:** [Logs Commands](/docs/cli/logs.md)
- **Plugin:** [Logs Plugin](/docs/plugins/logs.md)
