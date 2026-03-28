# File Storage

Multi-provider file storage with a unified interface. Read, write, upload, download, copy, move, and manage files across local filesystem, AWS S3, Cloudflare R2, Google Cloud Storage, and Google Drive.

## Contents

- [Provider Support](#provider-support)
- [Configuration](#configuration) - config.yaml reference, named handlers, per-provider auth
- [Core Operations](#core-operations) - read, write, exists, delete
- [Transfer Operations](#transfer-operations) - upload, download
- [Organize Operations](#organize-operations) - copy, move, list, get URL
- [Diagnostics](#diagnostics) - show config, switch handler, test connection
- [Agents](#agents) - upload, download, show-config, switch-handler, test-connection
- [Types & Schemas](#types--schemas) - TypeScript interfaces
- [Error Handling](#error-handling) - SDK errors, CLI exit codes, MCP error codes

---

## Provider Support

| Provider | Status | Type Key | Dependencies |
|----------|--------|----------|-------------|
| Local filesystem | **Full support** | `local` | None |
| AWS S3 | **Full support** | `s3` | `@aws-sdk/client-s3`, `@aws-sdk/credential-providers`, `@aws-sdk/s3-request-presigner` |
| Cloudflare R2 | **Full support** | `r2` | `@aws-sdk/client-s3` (S3-compatible) |
| Google Cloud Storage | **Full support** | `gcs` | `@google-cloud/storage` |
| Google Drive | **Full support** | `gdrive` | `googleapis` |

## Configuration

The `file:` section of `.fractary/config.yaml` defines named file handlers that other plugins (logs, docs) reference for storage.

### Minimal Configuration (Local)

```yaml
file:
  schema_version: "2.0"
  handlers:
    logs-write:
      type: local
      local:
        base_path: logs
    logs-archive:
      type: local
      local:
        base_path: logs/_archive
    docs-write:
      type: local
      local:
        base_path: docs
    docs-archive:
      type: local
      local:
        base_path: docs/_archive
```

### Full Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `schema_version` | string | Yes | Must be `"2.0"` |
| `handlers` | object | No | Named file handlers (v2.0 pattern) |
| `sources` | object | No | Named file sources (alternative v2.0 pattern) |
| `global_settings` | object | No | Global operation settings |
| `active_handler` | string | No | Legacy v1.0 field (deprecated) |

### Named Handlers

Each handler is a named entry that defines a storage backend. Other plugins reference these by name (e.g., `logs.storage.file_handlers[].write: logs-write`).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Provider: `local`, `s3`, `r2`, `gcs`, `gdrive` |
| `bucket` | string | Varies | Bucket name (S3, R2, GCS) |
| `prefix` | string | No | Path prefix within bucket |
| `region` | string | No | Cloud region (S3, GCS) |
| `project_id` | string | No | GCS project ID |
| `local.base_path` | string | Yes | Local fallback path (all providers) |
| `push.compress` | boolean | No | Compress on push (default: `false`) |
| `push.keep_local` | boolean | No | Keep local copy after push (default: `true`) |
| `auth` | object | No | Provider-specific authentication |

### Provider: Local

```yaml
handlers:
  my-local:
    type: local
    local:
      base_path: data
```

No additional auth required.

### Provider: AWS S3

```yaml
handlers:
  my-s3:
    type: s3
    bucket: my-bucket
    prefix: data/
    region: us-east-1
    local:
      base_path: data
    auth:
      profile: default                          # AWS profile name
      # or explicit credentials:
      accessKeyId: ${AWS_ACCESS_KEY_ID}
      secretAccessKey: ${AWS_SECRET_ACCESS_KEY}
    push:
      compress: false
      keep_local: true
```

| Auth Field | Description |
|-----------|-------------|
| `profile` | AWS profile name (from `~/.aws/credentials`) |
| `accessKeyId` | AWS access key ID |
| `secretAccessKey` | AWS secret access key |

### Provider: Cloudflare R2

```yaml
handlers:
  my-r2:
    type: r2
    bucket: my-bucket
    prefix: data/
    local:
      base_path: data
    auth:
      accountId: ${R2_ACCOUNT_ID}
      accessKeyId: ${R2_ACCESS_KEY_ID}
      secretAccessKey: ${R2_SECRET_ACCESS_KEY}
```

### Provider: Google Cloud Storage

```yaml
handlers:
  my-gcs:
    type: gcs
    bucket: my-bucket
    projectId: my-project-id
    prefix: data/
    region: us-central1
    local:
      base_path: data
    auth:
      keyFilePath: /path/to/service-account-key.json
```

### Provider: Google Drive

```yaml
handlers:
  my-gdrive:
    type: gdrive
    folderId: your_folder_id_here
    local:
      base_path: data
    auth:
      clientId: ${GDRIVE_CLIENT_ID}
      clientSecret: ${GDRIVE_CLIENT_SECRET}
      refreshToken: ${GDRIVE_REFRESH_TOKEN}
      rcloneRemote: remote-name
```

### Global Settings

```yaml
file:
  global_settings:
    retryAttempts: 3
    retryDelayMs: 1000
    timeoutSeconds: 30
    verifyChecksums: true
    parallelUploads: 4
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `retryAttempts` | number | `3` | Retry attempts for failed operations |
| `retryDelayMs` | number | `1000` | Delay between retries (ms) |
| `timeoutSeconds` | number | `30` | Operation timeout |
| `verifyChecksums` | boolean | `false` | Verify checksums after operations |
| `parallelUploads` | number | `1` | Number of parallel upload threads |

### Environment Variables

| Variable | Provider | Description |
|----------|----------|-------------|
| `AWS_ACCESS_KEY_ID` | S3 | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | S3 | AWS secret key |
| `AWS_DEFAULT_REGION` | S3 | Default region |
| `R2_ACCOUNT_ID` | R2 | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 | R2 secret key |
| `GDRIVE_CLIENT_ID` | Google Drive | OAuth client ID |
| `GDRIVE_CLIENT_SECRET` | Google Drive | OAuth client secret |
| `GDRIVE_REFRESH_TOKEN` | Google Drive | OAuth refresh token |

---

## Core Operations

### Quick Reference

| Operation | SDK | CLI | MCP | Plugin |
|-----------|-----|-----|-----|--------|
| [Read](#read-file) | [`read(path)`](#read-file-sdk) | [`file read`](#read-file-cli) | [`file_read`](#read-file-mcp) | [`/file-read`](#read-file-plugin) |
| [Write](#write-file) | [`write(path, content)`](#write-file-sdk) | [`file write`](#write-file-cli) | [`file_write`](#write-file-mcp) | [`/file-write`](#write-file-plugin) |
| [Exists](#check-exists) | [`exists(path)`](#check-exists-sdk) | [`file exists`](#check-exists-cli) | [`file_exists`](#check-exists-mcp) | [`/file-exists`](#check-exists-plugin) |
| [Delete](#delete-file) | [`delete(path)`](#delete-file-sdk) | [`file delete`](#delete-file-cli) | [`file_delete`](#delete-file-mcp) | [`/file-delete`](#delete-file-plugin) |

> CLI commands are prefixed with `fractary-core` (e.g., `fractary-core file read`).

---

### Read File

Read content from a storage path.

#### Read File: SDK

```typescript
const content = await fileManager.read('config.json');
if (content) {
  const config = JSON.parse(content);
}
```

**Returns:** `Promise<string | null>` - content or null if not found.

#### Read File: CLI

```bash
fractary-core file read config.json
fractary-core file read config.json --source s3-archive --json
```

| Flag | Description |
|------|-------------|
| `--source <name>` | Named source from config |
| `--json` | Output as JSON |

#### Read File: MCP

Tool: `fractary_file_read`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | Yes | File path |
| `encoding` | string | No | Encoding (default: `utf-8`) |

#### Read File: Plugin

Command: `/fractary-file-read`

| Argument | Required | Description |
|----------|----------|-------------|
| `<path>` | Yes | Storage path |
| `--source <name>` | No | Named source from config |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI (`fractary-core file read`). No agent delegation.

---

### Write File

Write content to a storage path.

#### Write File: SDK

```typescript
const fullPath = await fileManager.write('config.json', JSON.stringify(data, null, 2));
```

**Returns:** `Promise<string>` - full path of written file.

#### Write File: CLI

```bash
fractary-core file write config.json --content '{"key":"value"}'
fractary-core file write settings.yaml --content "key: value" --source mycloud
```

| Flag | Required | Description |
|------|----------|-------------|
| `--content <text>` | Yes | Content to write |
| `--source <name>` | No | Named source |
| `--json` | No | Output as JSON |

#### Write File: MCP

Tool: `fractary_file_write`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | Yes | File path |
| `content` | string | Yes | Content to write |
| `encoding` | string | No | Encoding (default: `utf-8`) |
| `overwrite` | boolean | No | Overwrite if exists |

#### Write File: Plugin

Command: `/fractary-file-write`

| Argument | Required | Description |
|----------|----------|-------------|
| `<path>` | Yes | Storage path |
| `--content <text>` | Yes | Content to write |
| `--source <name>` | No | Named source |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI (`fractary-core file write`). No agent delegation.

---

### Check Exists

Check if a file exists in storage.

#### Check Exists: SDK

```typescript
if (await fileManager.exists('config.json')) { /* ... */ }
```

#### Check Exists: CLI

```bash
fractary-core file exists config.json
fractary-core file exists data/report.csv --source s3-archive --json
```

#### Check Exists: MCP

Tool: `fractary_file_exists` with `{ "path": "config.json" }`

#### Check Exists: Plugin

Command: `/fractary-file-exists`

| Argument | Required | Description |
|----------|----------|-------------|
| `<path>` | Yes | Storage path |
| `--source <name>` | No | Named source |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI. No agent delegation.

---

### Delete File

Delete a file from storage.

#### Delete File: SDK

```typescript
await fileManager.delete('temp.json');
```

#### Delete File: CLI

```bash
fractary-core file delete temp/old-file.json
fractary-core file delete temp/old-file.json --source s3-archive
```

#### Delete File: MCP

Tool: `fractary_file_delete` with `{ "path": "temp.json" }`

#### Delete File: Plugin

Command: `/fractary-file-delete`

| Argument | Required | Description |
|----------|----------|-------------|
| `<path>` | Yes | Storage path |
| `--source <name>` | No | Named source |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI. No agent delegation.

---

## Transfer Operations

### Quick Reference

| Operation | SDK | CLI | MCP | Plugin |
|-----------|-----|-----|-----|--------|
| [Upload](#upload-file) | - | [`file upload`](#upload-file-cli) | - | [`/file-upload`](#upload-file-plugin) |
| [Download](#download-file) | - | [`file download`](#download-file-cli) | - | [`/file-download`](#download-file-plugin) |

> Upload and download are CLI/Plugin operations that handle local-to-remote and remote-to-local file transfers. The SDK provides `read`/`write` for content-level access.

---

### Upload File

Upload a local file to storage.

#### Upload File: CLI

```bash
fractary-core file upload ./export.csv
fractary-core file upload ./export.csv --remote-path data/exports/export.csv
fractary-core file upload ./backup.json --source s3-archive
```

| Flag | Description |
|------|-------------|
| `--remote-path <path>` | Remote storage path (defaults to filename) |
| `--source <name>` | Named source from config |
| `--json` | Output as JSON |

#### Upload File: Plugin

Command: `/fractary-file-upload`

| Argument | Required | Description |
|----------|----------|-------------|
| `<local-path>` | Yes | Path to local file |
| `--source <name>` | No | Named source from config |
| `--remote-path <path>` | No | Remote storage path |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Delegates to **`fractary-file-upload`** agent. The agent handles the upload using the CLI and provides status feedback.

---

### Download File

Download a file from storage to local path.

#### Download File: CLI

```bash
fractary-core file download data/config.json
fractary-core file download data/config.json --local-path ./local-config.json
```

| Flag | Description |
|------|-------------|
| `--local-path <path>` | Local destination (defaults to filename) |
| `--source <name>` | Named source from config |
| `--json` | Output as JSON |

#### Download File: Plugin

Command: `/fractary-file-download`

| Argument | Required | Description |
|----------|----------|-------------|
| `<remote-path>` | Yes | Remote storage path |
| `--source <name>` | No | Named source from config |
| `--local-path <path>` | No | Local destination path |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Delegates to **`fractary-file-download`** agent. The agent handles the download using the CLI.

---

## Organize Operations

### Quick Reference

| Operation | SDK | CLI | MCP | Plugin |
|-----------|-----|-----|-----|--------|
| [Copy](#copy-file) | [`copy(src, dest)`](#copy-file-sdk) | [`file copy`](#copy-file-cli) | [`file_copy`](#copy-file-mcp) | [`/file-copy`](#copy-file-plugin) |
| [Move](#move-file) | [`move(src, dest)`](#move-file-sdk) | [`file move`](#move-file-cli) | [`file_move`](#move-file-mcp) | [`/file-move`](#move-file-plugin) |
| [List](#list-files) | [`list(prefix?)`](#list-files-sdk) | [`file list`](#list-files-cli) | [`file_list`](#list-files-mcp) | [`/file-list`](#list-files-plugin) |
| [Get URL](#get-url) | [`getUrl(path, exp?)`](#get-url-sdk) | [`file get-url`](#get-url-cli) | - | [`/file-get-url`](#get-url-plugin) |

---

### Copy File

Copy a file within storage.

#### Copy File: SDK

```typescript
await fileManager.copy('config.json', 'config.backup.json');
```

#### Copy File: CLI

```bash
fractary-core file copy config.json config.backup.json
```

#### Copy File: MCP

Tool: `fractary_file_copy`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `source` | string | Yes | Source path |
| `destination` | string | Yes | Destination path |
| `overwrite` | boolean | No | Overwrite if exists |

#### Copy File: Plugin

Command: `/fractary-file-copy`

| Argument | Required | Description |
|----------|----------|-------------|
| `<src-path>` | Yes | Source path |
| `<dest-path>` | Yes | Destination path |
| `--source <name>` | No | Named source |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI. No agent delegation.

---

### Move File

Move a file within storage.

#### Move File: SDK

```typescript
await fileManager.move('temp/output.json', 'data/output.json');
```

#### Move File: CLI

```bash
fractary-core file move temp/output.json data/output.json
```

#### Move File: MCP

Tool: `fractary_file_move`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `source` | string | Yes | Source path |
| `destination` | string | Yes | Destination path |
| `overwrite` | boolean | No | Overwrite if exists |

#### Move File: Plugin

Command: `/fractary-file-move`

| Argument | Required | Description |
|----------|----------|-------------|
| `<src-path>` | Yes | Source path |
| `<dest-path>` | Yes | Destination path |
| `--source <name>` | No | Named source |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI. No agent delegation.

---

### List Files

List files in storage.

#### List Files: SDK

```typescript
const allFiles = await fileManager.list();
const dataFiles = await fileManager.list('data/');
```

#### List Files: CLI

```bash
fractary-core file list
fractary-core file list --prefix data/exports/
fractary-core file list --source s3-archive --json
```

| Flag | Description |
|------|-------------|
| `--prefix <prefix>` | Filter by prefix |
| `--source <name>` | Named source |
| `--json` | Output as JSON |

#### List Files: MCP

Tool: `fractary_file_list`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | No | Directory path |
| `pattern` | string | No | Glob filter |
| `recursive` | boolean | No | List recursively |

#### List Files: Plugin

Command: `/fractary-file-list`

| Argument | Required | Description |
|----------|----------|-------------|
| `--prefix <prefix>` | No | Filter by prefix |
| `--source <name>` | No | Named source |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI. No agent delegation.

---

### Get URL

Get a URL for a file in storage. For cloud providers, generates a presigned URL.

#### Get URL: SDK

```typescript
const url = await fileManager.getUrl('reports/summary.json', 3600);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `path` | string | File path |
| `expiresIn` | number | URL expiration in seconds (optional) |

**Returns:** `Promise<string | null>`

#### Get URL: CLI

```bash
fractary-core file get-url data/report.pdf
fractary-core file get-url data/report.pdf --expires-in 3600
```

| Flag | Description |
|------|-------------|
| `--expires-in <seconds>` | URL expiration in seconds |
| `--source <name>` | Named source |
| `--json` | Output as JSON |

#### Get URL: Plugin

Command: `/fractary-file-get-url`

| Argument | Required | Description |
|----------|----------|-------------|
| `<path>` | Yes | File path |
| `--expires-in <seconds>` | No | URL expiration |
| `--source <name>` | No | Named source |
| `--json` | No | Output as JSON |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Executes directly via CLI. No agent delegation.

---

## Diagnostics

### Quick Reference

| Operation | Plugin |
|-----------|--------|
| [Show Config](#show-config) | [`/file-show-config`](#show-config-plugin) |
| [Switch Handler](#switch-handler) | [`/file-switch-handler`](#switch-handler-plugin) |
| [Test Connection](#test-connection) | [`/file-test-connection`](#test-connection-plugin) |

> Diagnostics commands are available through CLI and Plugin interfaces.

---

### Show Config

Display current file plugin configuration.

#### Show Config: CLI

```bash
fractary-core file show-config
```

#### Show Config: Plugin

Command: `/fractary-file-show-config`

| Argument | Required | Description |
|----------|----------|-------------|
| `--raw` | No | Show raw config without formatting |
| `--path` | No | Show config file path |
| `--verify` | No | Verify handler connectivity |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Delegates to **`fractary-file-show-config`** agent.

---

### Switch Handler

Switch the active storage handler.

#### Switch Handler: Plugin

Command: `/fractary-file-switch-handler`

| Argument | Required | Description |
|----------|----------|-------------|
| `<handler>` | Yes | Handler name to switch to |
| `--no-test` | No | Skip connection test |
| `--force` | No | Force switch even if test fails |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Delegates to **`fractary-file-switch-handler`** agent. The agent updates the configuration and optionally tests the connection.

---

### Test Connection

Test storage connection to verify configuration.

#### Test Connection: CLI

```bash
fractary-core file test-connection
fractary-core file test-connection --source s3-archive
```

#### Test Connection: Plugin

Command: `/fractary-file-test-connection`

| Argument | Required | Description |
|----------|----------|-------------|
| `--handler <name>` | No | Specific handler to test |
| `--verbose` | No | Show detailed output |
| `--quick` | No | Quick connectivity check only |
| `--context <text>` | No | Additional instructions for AI |

**Delegation:** Delegates to **`fractary-file-test-connection`** agent.

---

## Agents

### fractary-file-upload

Handles file uploads from local filesystem to configured storage.

**Invoked by:** `/fractary-file-upload` command

### fractary-file-download

Handles file downloads from configured storage to local filesystem.

**Invoked by:** `/fractary-file-download` command

### fractary-file-show-config

Displays current file plugin configuration with formatted output.

**Invoked by:** `/fractary-file-show-config` command

### fractary-file-switch-handler

Switches the active storage handler, updates configuration, and optionally tests connectivity.

**Invoked by:** `/fractary-file-switch-handler` command

**Triggers proactively:** "switch handler", "change storage", "use S3", "use local"

### fractary-file-test-connection

Tests storage connectivity and reports status.

**Invoked by:** `/fractary-file-test-connection` command

---

## Types & Schemas

```typescript
interface FileInfo {
  path: string;
  name: string;
  size: number;
  isDirectory: boolean;
  createdAt: string;
  modifiedAt: string;
}

interface WriteOptions {
  overwrite?: boolean;     // default: true
  createDirs?: boolean;    // default: true
  encoding?: string;       // default: 'utf-8'
}
```

---

## Error Handling

### SDK Errors

```typescript
import { FileError } from '@fractary/core';

try {
  const content = await fileManager.read('nonexistent.json');
} catch (error) {
  if (error instanceof FileError) {
    console.error('File error:', error.message, error.code);
  }
}
```

### SDK Error Codes

| Code | Description |
|------|-------------|
| `NOT_FOUND` | File or directory not found |
| `ALREADY_EXISTS` | File exists (when overwrite=false) |
| `PERMISSION_DENIED` | Insufficient permissions |
| `PATH_TRAVERSAL` | Attempted path traversal attack |
| `PATTERN_MISMATCH` | File doesn't match allowed patterns |
| `IS_DIRECTORY` | Expected file but found directory |
| `IS_FILE` | Expected directory but found file |

### Path Safety

FileManager enforces path safety to prevent directory traversal:

```typescript
await fileManager.read('../../../etc/passwd');  // Error: Path traversal
await fileManager.read('/etc/passwd');          // Error: Absolute path
await fileManager.read('data/config.json');     // OK: relative path
```

### CLI Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | General error |
| `3` | Resource not found / validation failure |

### MCP Error Codes

| Code | Description |
|------|-------------|
| `NOT_FOUND` | File not found |
| `ALREADY_EXISTS` | File exists (overwrite not set) |
| `PERMISSION_DENIED` | Insufficient permissions |
| `PATH_TRAVERSAL` | Path traversal attempt |
