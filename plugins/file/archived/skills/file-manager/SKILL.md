# File Manager Skill (SDK-Backed)

> Unified file storage operations using the @fractary/core SDK.
> All storage backends (S3, R2, GCS, Google Drive, Local) are handled through the SDK.

## Overview

This skill provides file storage operations across multiple storage providers using the
@fractary/core SDK. Instead of routing to separate handler skills, all operations are
performed through the unified SDK storage factory.

**Supported Backends**:
- Local filesystem (default)
- AWS S3
- Cloudflare R2
- Google Cloud Storage
- Google Drive

## Configuration

Storage configuration is read from `.fractary/config.yaml`:

```yaml
file:
  schema_version: "2.0"
  sources:
    specs:
      type: s3
      bucket: my-bucket
      prefix: specs/
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

## Operations

### Upload

Upload a file to storage.

**Using CLI**:
```bash
# Upload to default storage
fractary-core file write --path "docs/file.txt" --content "$(cat ./local-file.txt)"

# Upload to specific source
fractary-core file write --source specs --path "SPEC-001.md" --content "$(cat ./spec.md)"
```

**Using SDK** (Node.js):
```javascript
import { FileManager, createStorageFromSource } from '@fractary/core/file';
import { loadFileConfig } from '@fractary/core/common/config';

// Option 1: Local storage
const localManager = new FileManager({ basePath: '.fractary/files' });
await localManager.write('docs/file.txt', content);

// Option 2: Configured source
const config = loadFileConfig();
const storage = createStorageFromSource('specs', config);
const manager = new FileManager({ storage });
await manager.write('SPEC-001.md', content);

// Option 3: Direct configuration
const s3Manager = new FileManager({
  storageConfig: {
    type: 's3',
    bucket: 'my-bucket',
    region: 'us-east-1',
    auth: { profile: 'default' }
  }
});
await s3Manager.write('file.txt', content);
```

### Download / Read

Read file content from storage.

**Using CLI**:
```bash
fractary-core file read --path "docs/file.txt"
fractary-core file read --source specs --path "SPEC-001.md"
```

**Using SDK**:
```javascript
const content = await manager.read('docs/file.txt');
```

### List

List files in storage.

**Using CLI**:
```bash
fractary-core file list --prefix "docs/"
fractary-core file list --source specs --prefix "2025/"
```

**Using SDK**:
```javascript
const files = await manager.list('docs/');
```

### Delete

Delete a file from storage.

**Using CLI**:
```bash
fractary-core file delete --path "docs/file.txt"
```

**Using SDK**:
```javascript
await manager.delete('docs/file.txt');
```

### Exists

Check if a file exists.

**Using CLI**:
```bash
fractary-core file exists --path "docs/file.txt"
```

**Using SDK**:
```javascript
const exists = await manager.exists('docs/file.txt');
```

### Get URL

Get a URL for a file (presigned for cloud storage).

**Using SDK**:
```javascript
const url = await manager.getUrl('docs/file.txt', 3600); // 1 hour expiry
```

### Copy / Move

Copy or move files within storage.

**Using CLI**:
```bash
fractary-core file copy --source "docs/old.txt" --destination "docs/new.txt"
fractary-core file move --source "docs/temp.txt" --destination "archive/temp.txt"
```

**Using SDK**:
```javascript
await manager.copy('docs/old.txt', 'docs/new.txt');
await manager.move('docs/temp.txt', 'archive/temp.txt');
```

## Helper Scripts

For backward compatibility and shell integration, helper scripts are provided:

### push.sh

Upload local file to configured cloud storage.

```bash
./skills/file-manager/scripts/push.sh <source-name> <local-path> <remote-path>

# Example
./skills/file-manager/scripts/push.sh specs ./SPEC-001.md archive/SPEC-001.md
```

### pull.sh

Download file from configured cloud storage.

```bash
./skills/file-manager/scripts/pull.sh <source-name> <remote-path> <local-path>

# Example
./skills/file-manager/scripts/pull.sh specs archive/SPEC-001.md ./SPEC-001.md
```

## Architecture

All storage operations are handled through the @fractary/core SDK:

```
file-manager Skill → SDK Storage Factory → S3Storage/GCSStorage/R2Storage/etc.
```

**Benefits**:
- Single source of truth for storage logic
- Type-safe TypeScript implementation
- Consistent error handling across all providers
- Easier testing and maintenance
- Works across CLI, MCP, and plugin contexts

## Dependencies

**Required for cloud storage**:
- `@aws-sdk/client-s3` - For S3 and R2
- `@google-cloud/storage` - For GCS
- `googleapis` - For Google Drive

Install as needed:
```bash
npm install @aws-sdk/client-s3 @aws-sdk/credential-providers
npm install @google-cloud/storage
npm install googleapis
```

## Examples

### Archive a Spec to S3

```javascript
import { getFileManagerForSource } from '@fractary/cli/sdk/factory';

const manager = await getFileManagerForSource('specs');
await manager.write('archive/SPEC-00029.md', specContent);
const url = await manager.getUrl('archive/SPEC-00029.md');
console.log(`Archived to: ${url}`);
```

### Sync Local to Cloud

```javascript
import { FileManager } from '@fractary/core/file';
import * as fs from 'fs';

const localManager = new FileManager({ basePath: '.fractary/specs' });
const cloudManager = new FileManager({
  storageConfig: {
    type: 's3',
    bucket: 'my-specs',
    region: 'us-east-1',
    prefix: 'archive/'
  }
});

const files = await localManager.list();
for (const file of files) {
  const content = await localManager.read(file);
  if (content) {
    await cloudManager.write(file, content);
  }
}
```
