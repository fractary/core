# Fractary File Plugin

Multi-provider file storage plugin with unified interface across Local, S3, R2, GCS, and Google Drive.

## Overview

The `fractary-file` plugin provides a unified interface for file storage operations across multiple storage providers. It uses the **@fractary/core SDK** to handle all storage backends through a single, type-safe implementation.

### Key Features

- **5 Storage Providers**: Local filesystem, AWS S3, Cloudflare R2, Google Cloud Storage, Google Drive
- **Multiple Sources**: Configure named storage sources and switch between them
- **Focused Commands**: Single-purpose commands for upload, download, list, delete
- **SDK-Backed**: All operations powered by @fractary/core SDK
- **Configuration-Driven**: Switch providers via configuration without code changes
- **Environment Variables**: Secure credential management
- **Zero-Config Default**: Local storage works out of the box

## Quick Start

### 1. Default (Local Storage)

No configuration needed! Local storage works immediately:

```bash
# Upload a file
file upload ./document.pdf --remote-path docs/document.pdf

# Download a file
file download docs/document.pdf --local-path ./downloaded.pdf

# List files
file list docs/

# Delete a file
file delete docs/document.pdf
```

### 2. Cloud Storage

Configure a named source in `.fractary/config.yaml`:

```yaml
file:
  schema_version: "2.0"
  sources:
    specs:
      type: s3
      bucket: my-specs-bucket
      prefix: archive/
      region: us-east-1
      auth:
        profile: default
    logs:
      type: r2
      bucket: my-logs
      accountId: ${R2_ACCOUNT_ID}
      auth:
        accessKeyId: ${R2_ACCESS_KEY_ID}
        secretAccessKey: ${R2_SECRET_ACCESS_KEY}
```

Then use with `--source`:

```bash
# Upload to S3 specs bucket
file upload ./SPEC-001.md --source specs --remote-path SPEC-001.md

# Download from R2 logs bucket
file download session.log --source logs --local-path ./session.log
```

## Commands

### Upload

Upload a local file to storage.

```bash
file upload <local-path> [--source <name>] [--remote-path <path>]
```

**Examples:**
```bash
file upload ./doc.pdf
file upload ./doc.pdf --remote-path archive/doc.pdf
file upload ./spec.md --source specs --remote-path SPEC-001.md
```

### Download

Download a file from storage.

```bash
file download <remote-path> [--source <name>] [--local-path <path>]
```

**Examples:**
```bash
file download docs/file.txt
file download archive/SPEC-001.md --source specs --local-path ./spec.md
```

### List

List files in storage.

```bash
file list [prefix] [--source <name>]
```

**Examples:**
```bash
file list
file list docs/
file list archive/ --source specs
```

### Delete

Delete a file from storage.

```bash
file delete <path> [--source <name>]
```

**Examples:**
```bash
file delete docs/old-file.txt
file delete archive/SPEC-001.md --source specs
```

## Architecture

```
┌─────────────────────────────────────┐
│  Commands                           │  ← User-facing CLI
│  (upload, download, list, delete)   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Agents                             │  ← Orchestration
│  (file-upload, file-download, etc.) │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  @fractary/core SDK                 │  ← Storage implementations
│  - S3Storage                        │
│  - R2Storage                        │
│  - GCSStorage                       │
│  - GDriveStorage                    │
│  - LocalStorage                     │
└─────────────────────────────────────┘
```

## Storage Providers

| Provider | Type | Auth Methods |
|----------|------|--------------|
| Local Filesystem | `local` | None |
| AWS S3 | `s3` | IAM profile, access keys |
| Cloudflare R2 | `r2` | API keys |
| Google Cloud Storage | `gcs` | ADC, service account |
| Google Drive | `gdrive` | OAuth2, service account |

## Configuration

### Source Configuration Examples

#### Local Storage

```yaml
file:
  sources:
    local:
      type: local
      basePath: .fractary/files
```

#### AWS S3

```yaml
file:
  sources:
    s3-archive:
      type: s3
      bucket: my-bucket
      prefix: archive/
      region: us-east-1
      auth:
        profile: default  # Use AWS profile
        # OR
        accessKeyId: ${AWS_ACCESS_KEY_ID}
        secretAccessKey: ${AWS_SECRET_ACCESS_KEY}
```

#### Cloudflare R2

```yaml
file:
  sources:
    r2-cdn:
      type: r2
      bucket: my-r2-bucket
      accountId: ${R2_ACCOUNT_ID}
      auth:
        accessKeyId: ${R2_ACCESS_KEY_ID}
        secretAccessKey: ${R2_SECRET_ACCESS_KEY}
```

#### Google Cloud Storage

```yaml
file:
  sources:
    gcs-backup:
      type: gcs
      bucket: my-gcs-bucket
      projectId: my-project
      auth:
        keyFile: /path/to/service-account.json
        # OR use ADC (Application Default Credentials)
```

#### Google Drive

```yaml
file:
  sources:
    gdrive:
      type: gdrive
      folderId: root  # or specific folder ID
      auth:
        clientId: ${GDRIVE_CLIENT_ID}
        clientSecret: ${GDRIVE_CLIENT_SECRET}
        refreshToken: ${GDRIVE_REFRESH_TOKEN}
```

## Directory Structure

```
plugins/file/
├── agents/
│   ├── file-upload.md      # Upload orchestration
│   ├── file-download.md    # Download orchestration
│   ├── file-list.md        # List orchestration
│   └── file-delete.md      # Delete orchestration
├── commands/
│   ├── upload.md           # Upload command
│   ├── download.md         # Download command
│   ├── list.md             # List command
│   └── delete.md           # Delete command
├── scripts/
│   └── storage.mjs         # Node.js SDK wrapper
├── config/
│   └── config.example.json # Configuration template
├── archived/
│   └── skills/             # Legacy handler skills
└── README.md
```

## SDK Usage

For programmatic access, use the @fractary/core SDK directly:

```javascript
import { FileManager, createStorageFromSource } from '@fractary/core/file';
import { loadFileConfig } from '@fractary/core/common/config';

// Option 1: Local storage (default)
const localManager = new FileManager({ basePath: '.fractary/files' });
await localManager.write('docs/file.txt', content);
const content = await localManager.read('docs/file.txt');

// Option 2: Configured source
const config = loadFileConfig();
const storage = createStorageFromSource('specs', config);
const manager = new FileManager({ storage });
await manager.write('SPEC-001.md', content);
const url = await manager.getUrl('SPEC-001.md', 3600);

// Option 3: Direct configuration
const s3Manager = new FileManager({
  storageConfig: {
    type: 's3',
    bucket: 'my-bucket',
    region: 'us-east-1',
    auth: { profile: 'default' }
  }
});
```

## Dependencies

### Core

- **Node.js** 18.0+
- **@fractary/core** SDK

### Cloud Storage SDKs (Optional)

Install only the SDKs you need:

```bash
# For S3 and R2
npm install @aws-sdk/client-s3 @aws-sdk/credential-providers @aws-sdk/s3-request-presigner

# For Google Cloud Storage
npm install @google-cloud/storage

# For Google Drive
npm install googleapis
```

## Security

### Credentials Best Practices

1. **Cloud Provider IAM Roles** (Best) - No credentials in config
2. **Environment Variables** (Good) - Reference with `${VAR_NAME}`
3. **Config Files** (Acceptable) - Use `chmod 0600`

### Path Security

- Path traversal prevention (`..` blocked)
- Validation before operations

## Troubleshooting

### Source Not Found

**Error**: Source 'specs' not found in configuration

**Solution**: Add the source to `.fractary/config.yaml`:
```yaml
file:
  sources:
    specs:
      type: s3
      bucket: my-bucket
```

### Environment Variable Not Set

**Error**: Environment variable R2_ACCESS_KEY_ID is not defined

**Solution**: Set the environment variable:
```bash
export R2_ACCESS_KEY_ID="your-access-key"
```

### SDK Not Installed

**Error**: Cannot find module '@aws-sdk/client-s3'

**Solution**: Install the required SDK:
```bash
npm install @aws-sdk/client-s3
```

## Changelog

### v3.0.0 (2025-01-18)

**Architecture Overhaul** - Commands + Agents pattern

- Replaced skills with focused commands and agents
- Consolidated all storage logic in @fractary/core SDK
- Simplified configuration to sources-based approach
- Removed legacy handler skills (archived)

### v2.0.0 (2025-01-15)

- Handler pattern architecture
- All 5 storage providers
- SDK-backed implementations

### v1.0.0

- Initial release
