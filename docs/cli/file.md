# File Toolset - CLI Reference

Command-line reference for the File toolset. File storage operations.

## Command Structure

```bash
fractary-core file <action> [options]
```

## File Commands

### file write

Write content to a file.

```bash
fractary-core file write <path> [options]
```

**Arguments:**
- `path` - File path (relative to base directory)

**Options:**
- `--content <text>` - Content to write
- `--file <path>` - Read content from file
- `--overwrite` - Overwrite if exists (default: true)
- `--no-overwrite` - Fail if file exists

**Examples:**
```bash
# Write JSON content
fractary-core file write config.json --content '{"key":"value"}'

# Write from file
fractary-core file write data/output.json --file ./local-file.json

# Pipe content
cat data.txt | fractary-core file write data/backup.txt
```

### file read

Read a file's content.

```bash
fractary-core file read <path> [options]
```

**Arguments:**
- `path` - File path

**Options:**
- `--format <type>` - Output format: `raw`, `json`

**Examples:**
```bash
# Read file
fractary-core file read config.json

# Parse JSON
fractary-core file read config.json --format json
```

### file list

List files.

```bash
fractary-core file list [prefix] [options]
```

**Arguments:**
- `prefix` (optional) - Path prefix to filter

**Options:**
- `--pattern <glob>` - Glob pattern
- `--recursive` - List recursively
- `--long` - Show detailed info
- `--format <type>` - Output format

**Examples:**
```bash
# List all files
fractary-core file list

# List in directory
fractary-core file list data/

# List JSON files
fractary-core file list --pattern "*.json"

# Detailed listing
fractary-core file list --long
```

**Long Format Output:**
```
SIZE       MODIFIED             PATH
1.2 KB     2024-01-15 10:30    config.json
45.6 KB    2024-01-14 15:45    data/export.json
2.3 KB     2024-01-13 09:00    settings.yaml
```

### file delete

Delete a file.

```bash
fractary-core file delete <path> [options]
```

**Arguments:**
- `path` - File path

**Options:**
- `--force` - Skip confirmation

**Example:**
```bash
fractary-core file delete temp/old-file.json
```

### file exists

Check if a file exists.

```bash
fractary-core file exists <path>
```

**Arguments:**
- `path` - File path

**Example:**
```bash
fractary-core file exists config.json && echo "File exists"
```

## Copy and Move Commands

### file copy

Copy a file.

```bash
fractary-core file copy <source> <destination> [options]
```

**Arguments:**
- `source` - Source file path
- `destination` - Destination file path

**Options:**
- `--overwrite` - Overwrite if exists

**Example:**
```bash
fractary-core file copy config.json config.backup.json
```

### file move

Move a file.

```bash
fractary-core file move <source> <destination> [options]
```

**Arguments:**
- `source` - Source file path
- `destination` - Destination file path

**Options:**
- `--overwrite` - Overwrite if exists

**Example:**
```bash
fractary-core file move temp/output.json data/output.json
```

## Directory Commands

### file mkdir

Create a directory.

```bash
fractary-core file mkdir <path>
```

**Arguments:**
- `path` - Directory path

**Example:**
```bash
fractary-core file mkdir data/exports/2024
```

### file rmdir

Remove a directory.

```bash
fractary-core file rmdir <path> [options]
```

**Arguments:**
- `path` - Directory path

**Options:**
- `--recursive` - Delete contents recursively
- `--force` - Skip confirmation

## Upload and Download Commands

### file upload

Upload a local file to storage.

```bash
fractary-core file upload <local-path> <remote-path> [options]
```

**Arguments:**
- `local-path` - Local file path
- `remote-path` - Remote destination path

**Options:**
- `--overwrite` - Overwrite if exists

**Example:**
```bash
fractary-core file upload ./export.csv data/exports/export.csv
```

### file download

Download a file from storage.

```bash
fractary-core file download <remote-path> <local-path> [options]
```

**Arguments:**
- `remote-path` - Remote file path
- `local-path` - Local destination path

**Options:**
- `--overwrite` - Overwrite if exists

**Example:**
```bash
fractary-core file download data/config.json ./local-config.json
```

## Configuration Commands

### file show-config

Show file storage configuration.

```bash
fractary-core file show-config
```

**Output:**
```
File Storage Configuration
==========================

Active Handler: local
Base Path: ./data

Handlers:
  local:
    base_path: ./data
    create_directories: true

  s3 (inactive):
    bucket: my-bucket
    region: us-east-1
```

### file test-connection

Test storage connection.

```bash
fractary-core file test-connection [options]
```

**Options:**
- `--handler <name>` - Test specific handler

**Example:**
```bash
fractary-core file test-connection
```

**Output:**
```
Testing local storage connection...
  ✓ Base path exists
  ✓ Write permission
  ✓ Read permission
  ✓ Delete permission

Connection test: PASSED
```

### file switch-handler

Switch active storage handler.

```bash
fractary-core file switch-handler <handler>
```

**Arguments:**
- `handler` - Handler name: `local`, `s3`

**Example:**
```bash
fractary-core file switch-handler s3
```

## Output Examples

### JSON Listing

```bash
fractary-core file list --format json
```

```json
[
  {
    "path": "config.json",
    "name": "config.json",
    "size": 1234,
    "isDirectory": false,
    "modifiedAt": "2024-01-15T10:30:00Z"
  },
  {
    "path": "data/",
    "name": "data",
    "isDirectory": true
  }
]
```

## Environment Variables

```bash
# Base directory
export FRACTARY_FILE_BASE_DIRECTORY=./data

# S3 configuration
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1
export FRACTARY_FILE_S3_BUCKET=my-bucket
```

## Other Interfaces

- **SDK:** [File API](/docs/sdk/js/file.md)
- **MCP:** [File Tools](/docs/mcp/server/file.md)
- **Plugin:** [File Plugin](/docs/plugins/file.md)
- **Configuration:** [File Config](/docs/guides/configuration.md#file-toolset)
