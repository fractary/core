# Fractary Core Configuration Setup Guide

## Overview

Your Fractary Core configuration has been successfully initialized with all 6 plugins:
- Work Tracking (GitHub Issues)
- Repository Management (GitHub)
- Logs Management
- File Storage (AWS S3)
- Specification Management
- Documentation Management

## Configuration Location

Configuration file: `/mnt/c/GitHub/fractary/core/.fractary/config.yaml`

## Project Information

- **Organization**: fractary
- **Repository**: core
- **Platform**: GitHub
- **Git Remote**: git@github-fractary:fractary/core.git
- **S3 Bucket**: fractary-core-files

## Plugin Configuration Summary

### 1. Work Tracking (GitHub Issues)

The work plugin is configured to use GitHub Issues for tracking work items.

**Status**: Requires GitHub Token

**Configuration**:
- Owner: fractary
- Repository: core
- API URL: https://api.github.com

**Setup Required**: Generate and set `GITHUB_TOKEN`

### 2. Repository Management (GitHub)

The repo plugin manages git operations and pull requests.

**Status**: Requires GitHub Token

**Configuration**:
- Default Branch: main
- Protected Branches: [main, master, production, staging]
- Merge Strategy: no-ff
- PR Template: standard

**Setup Required**: Same `GITHUB_TOKEN` as work plugin

### 3. Logs Management

The logs plugin captures and archives session logs.

**Status**: Ready to use

**Configuration**:
- Local Storage: `.fractary/logs/`
- Retention: 30 days local, forever in cloud
- Archive Index: `.fractary/logs/archive-index.json`
- Auto-backup: Enabled
- Session Logging: Enabled

**Features**:
- Automatic session capture with markdown format
- Sensitive data redaction (API keys, tokens, passwords)
- Cloud archival to S3
- Automatic cleanup after archive

### 4. File Storage (AWS S3)

The file plugin manages cloud storage for specifications and logs.

**Status**: AWS credentials detected and configured

**Configuration**:
- Storage Type: AWS S3
- Bucket: fractary-core-files
- Region: us-east-1
- Auth Profile: default

**Sources Configured**:
- **specs**: S3 storage for specification documents
  - Local Path: `.fractary/specs/`
  - Compression: Disabled
  - Keep Local: Yes
  
- **logs**: S3 storage for session logs
  - Local Path: `.fractary/logs/`
  - Compression: Enabled
  - Keep Local: Yes

**AWS Requirements**:
- AWS credentials configured in `~/.aws/credentials` or via environment variables
- S3 bucket `fractary-core-files` needs to be created
- IAM permissions for PutObject, GetObject, ListBucket

### 5. Specification Management

The spec plugin manages specification documents and architecture decisions.

**Status**: Ready to use

**Configuration**:
- Local Storage: `.fractary/specs/`
- Archive Index: `.fractary/specs/archive-index.json`
- Naming Prefix (Issue Specs): WORK (e.g., WORK-00001)
- Naming Prefix (Standalone Specs): SPEC (e.g., SPEC-0001)
- Auto-archive on: Issue close, PR merge, FABER release

**Features**:
- Issue-linked specifications
- Lifecycle-based archival
- Integration with work and file plugins
- Cloud archival to S3

### 6. Documentation Management

The docs plugin manages architecture decisions, guides, and API documentation.

**Status**: Ready to use

**Directory Structure Created**:
```
docs/
├── architecture/
│   ├── ADR/                 # Architecture Decision Records
│   └── designs/             # Design documents
├── guides/                  # User and developer guides
├── schema/                  # Data schemas
├── api/                     # API documentation
├── standards/               # Project standards
└── operations/
    └── runbooks/            # Operational runbooks
```

**Configuration**:
- ADR auto-numbering: Enabled (format: %05d)
- Architecture updates: Automatic index generation
- Schema format: Dual format (JSON + Markdown)
- API documentation: OpenAPI generation enabled

## Next Steps

### Step 1: Generate GitHub Token

GitHub Issues (work) and Repository management (repo) require a GitHub personal access token.

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" (classic)
3. Set the token name: "Fractary Core"
4. Select scopes:
   - `repo` (full control of private repositories)
   - `workflow` (manage GitHub Actions workflows)
   - `write:packages` (publish packages)
5. Click "Generate token"
6. Copy the token

### Step 2: Set GitHub Token Environment Variable

```bash
# On Linux/macOS/WSL:
export GITHUB_TOKEN=your_token_here

# To persist (add to ~/.bashrc or ~/.zshrc):
echo 'export GITHUB_TOKEN=your_token_here' >> ~/.bashrc
source ~/.bashrc
```

### Step 3: Create AWS S3 Bucket

The file storage plugin requires the S3 bucket to exist.

```bash
# Create the bucket
aws s3api create-bucket \
  --bucket fractary-core-files \
  --region us-east-1

# Verify it was created
aws s3 ls | grep fractary-core-files
```

### Step 4: Test Configuration

Once the token is set, test each plugin:

```bash
# Test work plugin
fractary-work:handler-work-tracker-github

# Test repo plugin
fractary-repo:pr-list

# Test file plugin (S3)
fractary-file:test-connection

# Test logs plugin
fractary-logs:read
```

### Step 5: Start Using Fractary

With the configuration complete, you can now:

1. **Create issues and manage work**:
   ```bash
   fractary-work:issue-create
   ```

2. **Manage branches and pull requests**:
   ```bash
   fractary-repo:pr-create
   ```

3. **Capture session logs**:
   ```bash
   fractary-logs:capture
   ```

4. **Manage specifications**:
   ```bash
   fractary-spec:create
   ```

5. **Generate documentation**:
   ```bash
   fractary-docs:write
   ```

## Configuration Details

### GitHub Token Requirements

The `GITHUB_TOKEN` environment variable must be set before using:
- Work plugin (GitHub Issues)
- Repository plugin (GitHub API)

**Scopes Required**:
- `repo` - Read/write access to repositories
- `workflow` - GitHub Actions workflows
- `write:packages` - Package management

**Alternative**: Use GitHub CLI
```bash
gh auth login
# This automatically sets GITHUB_TOKEN
```

### AWS Credentials

AWS credentials are required for S3 file storage. They are typically configured in:
- `~/.aws/credentials` (recommended)
- `~/.aws/config`
- Environment variables: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

**Current AWS Profile**: default

To use a different profile, update the configuration:
```yaml
file:
  sources:
    specs:
      auth:
        profile: your-profile-name
```

### S3 Bucket Naming

The bucket is named `fractary-core-files` following the pattern:
- Format: `{organization}-{project}-files`
- Example: `fractary-core-files`

## Troubleshooting

### GitHub Token Issues

If you get "401 Unauthorized" errors:
1. Verify the token is set: `echo $GITHUB_TOKEN`
2. Verify the token has correct scopes at: https://github.com/settings/tokens
3. Regenerate the token if needed

### AWS S3 Issues

If you get "NoSuchBucket" errors:
1. Verify the bucket exists: `aws s3 ls | grep fractary-core-files`
2. Create the bucket if it doesn't exist
3. Verify AWS credentials: `aws sts get-caller-identity`

### Configuration Validation

To validate the configuration:
```bash
python3 -c "
import yaml
with open('.fractary/config.yaml', 'r') as f:
    config = yaml.safe_load(f)
print('Configuration is valid')
print(f'Plugins: {list(config.keys())[1:]}')
"
```

## Configuration File Structure

The configuration file at `.fractary/config.yaml` contains:

1. **Version**: "2.0" (Fractary Core v2 format)
2. **Work Plugin**: GitHub Issues configuration
3. **Repo Plugin**: GitHub repository management
4. **Logs Plugin**: Session log capture and archival
5. **File Plugin**: AWS S3 storage configuration
6. **Codex Plugin**: Cross-project access settings
7. **Spec Plugin**: Specification management
8. **Docs Plugin**: Documentation management

All sensitive values (tokens, keys) use environment variable substitution:
- `${GITHUB_TOKEN}` - GitHub personal access token
- `${AWS_ACCESS_KEY_ID}` - AWS access key (if using env vars)
- `${AWS_SECRET_ACCESS_KEY}` - AWS secret key (if using env vars)

## Directory Structure

```
/mnt/c/GitHub/fractary/core/
├── .fractary/
│   ├── config.yaml              # Main configuration file
│   ├── logs/
│   │   └── archive-index.json   # Log archive index
│   └── specs/
│       └── archive-index.json   # Specification archive index
├── docs/
│   ├── architecture/
│   │   ├── ADR/                 # Architecture Decision Records
│   │   └── designs/
│   ├── guides/
│   ├── schema/
│   ├── api/
│   ├── standards/
│   └── operations/
│       └── runbooks/
└── ... (other project files)
```

## Support and Documentation

For more information on each plugin:
- Work Plugin: See `.fractary/config.yaml` `work` section
- Repo Plugin: See `.fractary/config.yaml` `repo` section
- Logs Plugin: See `.fractary/config.yaml` `logs` section
- File Plugin: See `.fractary/config.yaml` `file` section
- Spec Plugin: See `.fractary/config.yaml` `spec` section
- Docs Plugin: See `.fractary/config.yaml` `docs` section

---

**Configuration Date**: 2026-01-15
**Configuration Version**: 2.0
**Project**: fractary/core
