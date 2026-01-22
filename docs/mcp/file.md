# File Toolset - MCP Tools Reference

MCP tools reference for the File toolset. Tools for file storage operations.

## Tool Naming Convention

```
fractary_file_{action}
```

## File Tools

### fractary_file_write

Write content to a file.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | Yes | File path (relative to base) |
| `content` | string | Yes | Content to write |
| `overwrite` | boolean | No | Overwrite if exists (default: true) |

**Example:**
```json
{
  "path": "config.json",
  "content": "{\"key\": \"value\"}",
  "overwrite": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "path": "config.json",
    "fullPath": "/project/data/config.json",
    "size": 18
  }
}
```

### fractary_file_read

Read a file's content.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | Yes | File path |

**Example:**
```json
{
  "path": "config.json"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "path": "config.json",
    "content": "{\"key\": \"value\"}",
    "size": 18
  }
}
```

### fractary_file_exists

Check if a file exists.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | Yes | File path |

**Response:**
```json
{
  "success": true,
  "data": {
    "path": "config.json",
    "exists": true
  }
}
```

### fractary_file_delete

Delete a file.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | Yes | File path |

**Response:**
```json
{
  "success": true,
  "data": {
    "path": "config.json",
    "deleted": true
  }
}
```

### fractary_file_list

List files.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prefix` | string | No | Path prefix to filter |
| `pattern` | string | No | Glob pattern |
| `recursive` | boolean | No | List recursively |

**Example:**
```json
{
  "prefix": "data/",
  "recursive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "path": "data/config.json",
        "name": "config.json",
        "size": 1234,
        "isDirectory": false,
        "modifiedAt": "2024-01-15T10:30:00Z"
      },
      {
        "path": "data/exports/",
        "name": "exports",
        "isDirectory": true
      }
    ]
  }
}
```

### fractary_file_copy

Copy a file.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `source` | string | Yes | Source file path |
| `destination` | string | Yes | Destination file path |
| `overwrite` | boolean | No | Overwrite if exists |

**Example:**
```json
{
  "source": "config.json",
  "destination": "config.backup.json"
}
```

### fractary_file_move

Move a file.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `source` | string | Yes | Source file path |
| `destination` | string | Yes | Destination file path |
| `overwrite` | boolean | No | Overwrite if exists |

## Directory Tools

### fractary_file_mkdir

Create a directory.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | Yes | Directory path |

**Example:**
```json
{
  "path": "data/exports/2024"
}
```

### fractary_file_rmdir

Remove a directory.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | Yes | Directory path |
| `recursive` | boolean | No | Delete contents recursively |

## Upload/Download Tools

### fractary_file_upload

Upload a local file to storage.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `localPath` | string | Yes | Local file path |
| `remotePath` | string | Yes | Remote destination path |
| `overwrite` | boolean | No | Overwrite if exists |

**Example:**
```json
{
  "localPath": "./export.csv",
  "remotePath": "data/exports/export.csv"
}
```

### fractary_file_download

Download a file from storage.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `remotePath` | string | Yes | Remote file path |
| `localPath` | string | Yes | Local destination path |
| `overwrite` | boolean | No | Overwrite if exists |

## Tool Summary

| Tool | Description |
|------|-------------|
| `fractary_file_write` | Write a file |
| `fractary_file_read` | Read a file |
| `fractary_file_exists` | Check file existence |
| `fractary_file_delete` | Delete a file |
| `fractary_file_list` | List files |
| `fractary_file_copy` | Copy a file |
| `fractary_file_move` | Move a file |
| `fractary_file_mkdir` | Create directory |
| `fractary_file_rmdir` | Remove directory |
| `fractary_file_upload` | Upload file |
| `fractary_file_download` | Download file |

## Error Responses

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "File 'missing.json' not found"
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `NOT_FOUND` | File or directory not found |
| `ALREADY_EXISTS` | File exists (when overwrite=false) |
| `PERMISSION_DENIED` | Insufficient permissions |
| `PATH_TRAVERSAL` | Path traversal attempt detected |
| `PATTERN_MISMATCH` | File doesn't match allowed patterns |

## Other Interfaces

- **SDK:** [File API](/docs/sdk/file.md)
- **CLI:** [File Commands](/docs/cli/file.md)
- **Plugin:** [File Plugin](/docs/plugins/file.md)
