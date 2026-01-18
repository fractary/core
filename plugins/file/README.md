# Fractary File Plugin

Multi-provider file storage plugin with unified interface across Local, R2, S3, GCS, and Google Drive.

## Overview

The `fractary-file` plugin provides a unified interface for file storage operations across multiple storage providers. It uses the **@fractary/core SDK** to handle all storage backends through a single, type-safe implementation.

### Key Features

- **5 Storage Providers**: Local filesystem, Cloudflare R2, AWS S3, Google Cloud Storage, Google Drive
- **Multiple Handlers Simultaneously**: Configure multiple storage providers and choose per-operation
- **6 Core Operations**: Upload, download, delete, list, get-url, read
- **Handler Pattern**: Easy to add new storage providers
- **Configuration-Driven**: Switch providers via configuration without code changes
- **Per-Operation Override**: Route specific files to specific storage locations
- **Environment Variables**: Secure credential management
- **Zero-Config Default**: Local handler works out of the box
- **IAM Role Support**: S3 and GCS work without credentials
- **OAuth2 Integration**: Google Drive with automatic token refresh

## Storage Providers

| Provider | Status | Auth Method | CLI Tool | Operations |
|----------|--------|-------------|----------|------------|
| **Local Filesystem** | ✅ Complete | None | Native bash | 6/6 |
| **Cloudflare R2** | ✅ Complete | API Key | rclone/aws | 6/6 |
| **AWS S3** | ✅ Complete | IAM Roles/Keys | aws cli | 6/6 |
| **Google Cloud Storage** | ✅ Complete | ADC/SA Key | gcloud | 6/6 |
| **Google Drive** | ✅ Complete | OAuth2 | rclone | 6/6 |

## Quick Start

### 1. Default (Local Storage) - Zero Configuration

No configuration needed! Works immediately with local filesystem:

```bash
# Files stored in project root by default
Use the @agent-fractary-file:file-manager agent to upload:
{
  "operation": "upload",
  "parameters": {
    "local_path": "./document.pdf",
    "remote_path": "docs/document.pdf"
  }
}
```

**Perfect for**: Development, testing, temporary files

### 2. Single Cloud Storage Provider

Configure one cloud provider as your default storage:

1. **Run init wizard**:
```bash
/fractary-file:init --handlers s3
```

2. **Set environment variables**:
```bash
# For S3 (or use IAM roles)
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
```

3. **Use immediately**:
```bash
Use the @agent-fractary-file:file-manager agent:
{
  "operation": "upload",
  "parameters": {
    "local_path": "./file.txt",
    "remote_path": "folder/file.txt"
  }
}
# → Uploads to S3
```

**Perfect for**: Production deployments with single storage backend

### 3. Multiple Storage Providers (Advanced)

Configure multiple providers and route different files to different locations.

**Use Cases**:
- Local for working files, S3 for backups
- R2 for public CDN content, S3 for archival
- GCS for Google services integration, local for dev

1. **Initialize with multiple handlers**:
```bash
# Interactive setup for multiple providers
/fractary-file:init

# Or specify handlers directly
/fractary-file:init --handlers local,s3,r2
```

2. **Use default handler** (configured as `active_handler`):
```bash
Use the @agent-fractary-file:file-manager agent:
{
  "operation": "upload",
  "parameters": {
    "local_path": "./document.pdf",
    "remote_path": "docs/document.pdf"
  }
}
# → Uses active_handler (e.g., local)
```

3. **Override to specific handler** for specific files:
```bash
# Store backups on S3
{
  "operation": "upload",
  "parameters": {
    "local_path": "./backup.tar.gz",
    "remote_path": "backups/2025-01-15.tar.gz"
  },
  "handler_override": "s3"
}

# Store specs on R2 for global CDN
{
  "operation": "upload",
  "parameters": {
    "local_path": "./spec-123.md",
    "remote_path": "specs/spec-123.md"
  },
  "handler_override": "r2"
}
```

**Perfect for**: Complex workflows needing different storage for different file types

## Migrating from Single to Multi-Handler

Already have a config with one handler? You can add more without reconfiguring:

**Option 1: Re-run Init with Multiple Handlers**
```bash
# This will prompt to overwrite existing config
/fractary-file:init --handlers local,s3,r2
```

**Option 2: Manually Edit Config**
```bash
# Edit your existing config
vim .fractary/config.yaml

# Add new handlers to the "handlers" object:
{
  "active_handler": "s3",
  "handlers": {
    "s3": { /* your existing S3 config */ },
    "r2": { /* add R2 config */ },
    "local": { /* add local config */ }
  }
}
```

**Option 3: Keep Existing Config, Override When Needed**
- Don't change config at all
- Use `handler_override` in requests to route specific files elsewhere
- Great for gradual migration or occasional use

**Backwards Compatibility**:
- Existing single-handler configs work unchanged
- `--handler` flag still works (converted to `--handlers` internally)
- No breaking changes

## Architecture

The plugin uses the **@fractary/core SDK** for all storage operations:

```
┌─────────────────────────────────────┐
│  file-manager Skill                 │  ← Orchestration, validation
│  (skills/file-manager/SKILL.md)    │
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

**Benefits**:
- **Single source of truth** for all storage logic
- **Type-safe TypeScript** implementations
- **Consistent error handling** across providers
- **Unified interface** for CLI, MCP, and plugins
- **Lazy-loaded SDKs** - only loads what you need

## Operations

All handlers implement these 6 operations:

### 1. Upload

Upload a file to storage.

```json
{
  "operation": "upload",
  "parameters": {
    "local_path": "./file.txt",
    "remote_path": "folder/file.txt",
    "public": false
  }
}
```

**Returns**: URL, size, checksum

### 2. Download

Download a file from storage.

```json
{
  "operation": "download",
  "parameters": {
    "remote_path": "folder/file.txt",
    "local_path": "./downloaded-file.txt"
  }
}
```

**Returns**: Local path, size, checksum

### 3. Delete

Delete a file from storage.

```json
{
  "operation": "delete",
  "parameters": {
    "remote_path": "folder/file.txt"
  }
}
```

**Returns**: Confirmation

### 4. List

List files in storage.

```json
{
  "operation": "list",
  "parameters": {
    "prefix": "folder/",
    "max_results": 100
  }
}
```

**Returns**: Array of file metadata (path, size, modified_at)

### 5. Get URL

Generate an accessible URL for a file.

```json
{
  "operation": "get-url",
  "parameters": {
    "remote_path": "folder/file.txt",
    "expires_in": 3600
  }
}
```

**Returns**: URL (public or presigned), expiration

### 6. Read

Stream file contents without downloading (NEW).

```json
{
  "operation": "read",
  "parameters": {
    "remote_path": "folder/file.txt",
    "max_bytes": 10485760
  }
}
```

**Returns**: File contents to stdout (truncated if > max_bytes)

**Use Cases**: Read archived specs, logs, configs without downloading.
**Limits**: Default 10MB, max 50MB. Files larger should be downloaded.

## Global Arguments

All commands support the `--context` argument for passing additional instructions:

```bash
--context "<text>"
```

This argument is always optional and appears as the final argument. When provided, agents prepend the context as additional instructions to their workflow.

**Examples:**

```bash
# Guide initialization
/fractary-file:init --context "Configure for high-availability production use"

# Customize connection testing
/fractary-file:test-connection --context "Verify with verbose output"

# Adjust handler selection
/fractary-file:show-config --context "Focus on S3 configuration details"
```

See [Context Argument Standard](../../docs/plugin-development/context-argument-standard.md) for full documentation.

## Configuration

Configuration is stored in `.fractary/config.yaml`.

**Multi-Handler Support**: You can configure multiple storage providers in a single configuration file. Set `active_handler` to your default, and override per-operation as needed.

### Configuration File Location (Priority Order)

1. **Project config**: `.fractary/config.yaml` (highest priority)
2. **Global config**: `~/.config/fractary/file/config.json` (fallback)
3. **Default**: Local handler with `.` (project root) base path

### Configuration Schema

```json
{
  "schema_version": "1.0",
  "active_handler": "local",
  "handlers": {
    "local": { /* local config */ },
    "r2": { /* r2 config */ },
    "s3": { /* s3 config */ },
    "gcs": { /* gcs config */ },
    "gdrive": { /* gdrive config */ }
  },
  "global_settings": {
    "retry_attempts": 3,
    "retry_delay_ms": 1000,
    "timeout_seconds": 300,
    "verify_checksums": true
  }
}
```

**Example: Multi-Handler Configuration**

Configure local for working files and S3 for backups:

```json
{
  "schema_version": "1.0",
  "active_handler": "local",
  "handlers": {
    "local": {
      "base_path": ".",
      "create_directories": true,
      "permissions": "0755"
    },
    "s3": {
      "region": "us-east-1",
      "bucket_name": "my-backups",
      "access_key_id": "${AWS_ACCESS_KEY_ID}",
      "secret_access_key": "${AWS_SECRET_ACCESS_KEY}"
    }
  }
}
```

Now you can use `local` by default, and override to `s3` for specific files.

### Handler Configurations

#### Local Filesystem

**Zero configuration needed!** Works with defaults.

```json
{
  "active_handler": "local",
  "handlers": {
    "local": {
      "base_path": ".",
      "create_directories": true,
      "permissions": "0755"
    }
  }
}
```

**Features**:
- No credentials needed
- Works offline
- Fast operations
- Good for development/testing

**Guide**: `skills/handler-storage-local/docs/local-storage-guide.md`

#### Cloudflare R2

```json
{
  "active_handler": "r2",
  "handlers": {
    "r2": {
      "account_id": "${R2_ACCOUNT_ID}",
      "access_key_id": "${R2_ACCESS_KEY_ID}",
      "secret_access_key": "${R2_SECRET_ACCESS_KEY}",
      "bucket_name": "my-bucket",
      "public_url": "https://pub-xxxxx.r2.dev",
      "region": "auto"
    }
  }
}
```

**Features**:
- S3-compatible API
- No egress fees
- Public and presigned URLs
- Global distribution

**Requirements**: AWS CLI configured for R2, R2 API credentials

#### AWS S3

**With IAM Roles** (Recommended for EC2/ECS/EKS):
```json
{
  "active_handler": "s3",
  "handlers": {
    "s3": {
      "region": "us-east-1",
      "bucket_name": "my-bucket"
    }
  }
}
```

**With Credentials**:
```json
{
  "active_handler": "s3",
  "handlers": {
    "s3": {
      "region": "us-east-1",
      "bucket_name": "my-bucket",
      "access_key_id": "${AWS_ACCESS_KEY_ID}",
      "secret_access_key": "${AWS_SECRET_ACCESS_KEY}"
    }
  }
}
```

**Features**:
- IAM role support (no credentials needed)
- S3-compatible services (MinIO, etc.)
- Public and presigned URLs
- Extensive ecosystem

**Requirements**: AWS CLI, optional IAM role or credentials

**IAM Policy Required**:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject", "s3:ListBucket"],
    "Resource": ["arn:aws:s3:::my-bucket", "arn:aws:s3:::my-bucket/*"]
  }]
}
```

#### Google Cloud Storage

**With Application Default Credentials** (Recommended for GCE/GKE):
```json
{
  "active_handler": "gcs",
  "handlers": {
    "gcs": {
      "project_id": "my-project",
      "bucket_name": "my-bucket",
      "region": "us-central1"
    }
  }
}
```

**With Service Account Key**:
```json
{
  "active_handler": "gcs",
  "handlers": {
    "gcs": {
      "project_id": "my-project",
      "bucket_name": "my-bucket",
      "service_account_key": "${GOOGLE_APPLICATION_CREDENTIALS}",
      "region": "us-central1"
    }
  }
}
```

**Features**:
- Application Default Credentials support
- Workload Identity for GKE
- Signed URLs
- Regional/multi-regional storage

**Requirements**: gcloud CLI, optional service account key

**IAM Roles Required**:
- `roles/storage.objectCreator` - Upload
- `roles/storage.objectViewer` - Download/read
- `roles/storage.objectAdmin` - Full access

#### Google Drive

```json
{
  "active_handler": "gdrive",
  "handlers": {
    "gdrive": {
      "client_id": "${GDRIVE_CLIENT_ID}",
      "client_secret": "${GDRIVE_CLIENT_SECRET}",
      "folder_id": "root",
      "rclone_remote_name": "gdrive"
    }
  }
}
```

**Features**:
- OAuth2 authentication
- Automatic token refresh
- Shareable links
- Folder organization
- 15GB free storage

**Requirements**: rclone with OAuth2 setup

**Setup Guide**: `skills/handler-storage-gdrive/docs/oauth-setup-guide.md` (**REQUIRED READING**)

**Quick Setup**:
1. Install rclone: `brew install rclone`
2. Create OAuth credentials in Google Cloud Console
3. Run `rclone config` for interactive OAuth flow
4. Configure fractary-file with client ID/secret

## Usage Examples

### Agent Invocation (Declarative)

```
Use the @agent-fractary-file:file-manager agent to upload specification:
{
  "operation": "upload",
  "parameters": {
    "local_path": "./spec-123.md",
    "remote_path": "specs/2025/01/spec-123.md",
    "public": false
  }
}
```

### Multiple Operations

```
# Upload file
Use @agent-fractary-file:file-manager to upload:
{ "operation": "upload", "parameters": {"local_path": "./doc.pdf", "remote_path": "docs/doc.pdf"} }

# List files
Use @agent-fractary-file:file-manager to list:
{ "operation": "list", "parameters": {"prefix": "docs/", "max_results": 50} }

# Get URL
Use @agent-fractary-file:file-manager to get URL:
{ "operation": "get-url", "parameters": {"remote_path": "docs/doc.pdf", "expires_in": 7200} }

# Read file
Use @agent-fractary-file:file-manager to read:
{ "operation": "read", "parameters": {"remote_path": "docs/config.json", "max_bytes": 1048576} }
```

### Handler Override

Use a specific handler for one operation:

```json
{
  "operation": "upload",
  "parameters": {
    "local_path": "./file.txt",
    "remote_path": "backup/file.txt"
  },
  "handler_override": "s3"
}
```

## Security

### Credentials

**Best Practices** (in order of preference):

1. **Cloud Provider IAM Roles** (Best)
   - AWS: EC2 instance profiles, ECS task roles
   - GCP: Workload Identity, ADC
   - No credentials in config
   - Automatic rotation

2. **Environment Variables** (Good)
   - Store in environment, reference in config
   - Never commit actual values
   - Use secrets management (AWS Secrets Manager, etc.)

3. **Config Files with Restricted Permissions** (Acceptable)
   - Permissions: `chmod 0600`
   - Outside version control
   - Encrypted at rest

4. **Hardcoded** (Never - Development Only)
   - Only for local testing
   - Never commit

### File Permissions

```bash
# Automatically set by plugin
chmod 0600 .fractary/config.yaml
chmod 0600 ~/.config/fractary/file/config.json
```

### Path Security

- Path traversal prevention (`..` blocked)
- Validation before operations
- Audit logging available

### Credential Rotation

- **IAM Roles**: Automatic (hourly)
- **API Tokens**: Every 90 days recommended
- **OAuth Tokens**: Automatic refresh via rclone

## Integration

### With FABER Plugins

Used by fractary-faber workflows:
- **fractary-spec**: Archive specifications
- **fractary-logs**: Archive session logs
- **fractary-docs**: Store documentation
- **fractary-faber**: Workflow artifacts

### With Codex

The fractary-codex plugin can read archived content via the `read` operation without downloading.

## Directory Structure

```
plugins/file/
├── agents/
│   └── file-*.md                 # Orchestration agents
├── commands/
│   └── *.md                      # CLI commands
├── config/
│   └── config.example.json       # Configuration template
├── skills/
│   ├── common/
│   │   └── functions.sh          # Shared utilities
│   └── file-manager/             # Main skill (SDK-backed)
│       ├── SKILL.md              # Skill documentation
│       └── scripts/
│           ├── storage.mjs       # Node.js SDK wrapper
│           ├── push.sh           # Upload helper
│           └── pull.sh           # Download helper
├── archived/                     # Legacy handler skills
│   └── skills/
│       └── handler-storage-*/    # Old handler implementations
└── README.md                     # This file
```

## Adding New Storage Providers

To add a new storage provider, implement it in the SDK:

1. **Create storage implementation** in `sdk/js/src/file/`:
   ```typescript
   // sdk/js/src/file/newprovider.ts
   export class NewProviderStorage implements Storage {
     async write(id: string, content: string): Promise<string> { ... }
     async read(id: string): Promise<string | null> { ... }
     async exists(id: string): Promise<boolean> { ... }
     async list(prefix?: string): Promise<string[]> { ... }
     async delete(id: string): Promise<void> { ... }
     async getUrl?(id: string, expiresIn?: number): Promise<string | null> { ... }
   }
   ```

2. **Add configuration types** in `sdk/js/src/file/types.ts`

3. **Update factory** in `sdk/js/src/file/factory.ts` to handle the new type

4. **Export** from `sdk/js/src/file/index.ts`

5. **Add optional peer dependency** if using a cloud SDK

The plugin will automatically support the new provider through the SDK.

## Troubleshooting

### Configuration Not Found

**Error**: No configuration file found, using defaults

**Solution**: Configuration is optional! Local handler works with defaults. To configure:
```bash
cp plugins/file/config/config.example.json .fractary/config.yaml
```

### Handler Not Configured

**Error**: Handler 'r2' is not configured

**Solution**: Add handler configuration to config.json and set environment variables:
```bash
export R2_ACCOUNT_ID="..."
export R2_ACCESS_KEY_ID="..."
export R2_SECRET_ACCESS_KEY="..."
```

### Environment Variable Not Set

**Error**: R2 access_key_id references undefined environment variable: R2_ACCESS_KEY_ID

**Solution**: Set the environment variable:
```bash
export R2_ACCESS_KEY_ID="your-access-key"
```

### Permission Denied

**Error**: Config file permissions too open (644)

**Solution**: Set secure permissions:
```bash
chmod 0600 .fractary/config.yaml
```

### rclone Not Found (Google Drive)

**Error**: rclone not found

**Solution**: Install rclone:
```bash
# macOS
brew install rclone

# Linux
curl https://rclone.org/install.sh | sudo bash
```

### OAuth Token Expired (Google Drive)

**Error**: Token expired and refresh not working

**Solution**: Reconnect rclone:
```bash
rclone config reconnect gdrive:
```

## Performance

### Context Efficiency

- **Agent**: ~300 lines in context
- **Skill**: ~200 lines in context
- **Scripts**: 0 lines in context (executed outside LLM)
- **Total**: ~500 lines vs ~1200 lines (traditional approach)
- **Savings**: ~58% context reduction

### Operation Performance

- **Local**: Instant (filesystem speed)
- **Cloud**: Network-dependent
  - Upload/Download: Limited by bandwidth
  - List: Fast (<1s for hundreds of files)
  - Delete: Fast (<1s)
  - Get URL: Instant (generates locally)

### Retry Logic

All cloud handlers implement retry with exponential backoff:
- Attempts: 3 (configurable)
- Initial delay: 1s
- Backoff: Exponential (1s, 2s, 4s)

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

| Provider | npm Package | Authentication |
|----------|-------------|----------------|
| Local    | (none)      | Filesystem permissions |
| S3       | @aws-sdk/client-s3 | IAM roles, profiles, or keys |
| R2       | @aws-sdk/client-s3 | R2 API tokens |
| GCS      | @google-cloud/storage | ADC or service account |
| GDrive   | googleapis  | OAuth2 |

## Testing

Test a handler:

```bash
# Test local handler (no setup needed)
echo "test content" > test.txt
Use @agent-fractary-file:file-manager to upload:
{ "operation": "upload", "parameters": {"local_path": "./test.txt", "remote_path": "test/test.txt"} }

Use @agent-fractary-file:file-manager to list:
{ "operation": "list", "parameters": {"prefix": "test/"} }

Use @agent-fractary-file:file-manager to read:
{ "operation": "read", "parameters": {"remote_path": "test/test.txt"} }

Use @agent-fractary-file:file-manager to delete:
{ "operation": "delete", "parameters": {"remote_path": "test/test.txt"} }
```

## Status

**Current Version**: 2.0.0

**Implementation Status**:
- ✅ SPEC-00029-01 (Architecture): 100% Complete
- ✅ SPEC-00029-02 (Handlers): 100% Complete
- ⏸️ SPEC-00029-03 (Init Command): Deferred (manual setup documented)

**All Core Features Complete!**

## Documentation

- **Configuration Example**: `config/config.example.json`
- **Common Functions**: `skills/common/functions.sh`
- **Routing Logic**: `skills/file-manager/workflow/route-operation.md`
- **Validation**: `skills/file-manager/workflow/validate-config.md`
- **Local Guide**: `skills/handler-storage-local/docs/local-storage-guide.md`
- **Google Drive OAuth**: `skills/handler-storage-gdrive/docs/oauth-setup-guide.md`

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review handler-specific documentation
3. Check specifications in `specs/SPEC-00029-*.md`
4. Report issues on GitHub

## License

Part of the Fractary plugin ecosystem.

## Changelog

### v2.0.0 (2025-01-15)

**Major Rewrite** - Handler pattern architecture

- ✅ Implemented handler pattern for multi-provider support
- ✅ All 5 handlers complete: local, R2, S3, GCS, Google Drive
- ✅ All 6 operations on all handlers
- ✅ New `read` operation for streaming file contents
- ✅ Configuration system with fallback chain
- ✅ Environment variable support
- ✅ IAM role support (S3, GCS)
- ✅ OAuth2 integration (Google Drive)
- ✅ Comprehensive documentation
- ✅ 58% context reduction

### v1.0.0 (2024-XX-XX)

Initial release
- Basic R2 support only
- Monolithic architecture
