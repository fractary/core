# Fractary Core - Files Index

## Overview

This document provides an index of all Fractary Core configuration and setup files created during initialization.

**Date**: 2026-01-15
**Project**: fractary/core
**Configuration Version**: 2.0

---

## Main Configuration File

### .fractary/config.yaml (255 lines)

The unified Fractary Core configuration file containing all plugin configurations.

**Location**: `/mnt/c/GitHub/fractary/core/.fractary/config.yaml`

**Sections**:
- `version`: Configuration version (2.0)
- `work`: GitHub Issues work tracking
- `repo`: GitHub repository management
- `logs`: Session logging and archival
- `file`: AWS S3 storage configuration
- `codex`: Cross-project access
- `spec`: Specification management
- `docs`: Documentation management

**Status**: Valid YAML, all sections present, ready to use

**Environment Variables Used**:
- `${GITHUB_TOKEN}` - GitHub personal access token
- AWS credentials used via `default` profile

---

## Setup Documentation Files

### 1. QUICK_START.txt (Most Important - Start Here!)

**Location**: `/mnt/c/GitHub/fractary/core/QUICK_START.txt`

**Purpose**: Fastest path to getting started

**Contents**:
- Immediate actions checklist
- Plugin readiness status
- Common commands quick reference
- Directory structure overview
- Troubleshooting tips
- Important notes

**Time to Read**: 5 minutes

**Best For**: Quick reference, rapid onboarding

**When to Use**: First thing after initialization

---

### 2. FRACTARY_SETUP.md (Comprehensive)

**Location**: `/mnt/c/GitHub/fractary/core/FRACTARY_SETUP.md`

**Purpose**: Detailed setup and configuration guide

**Contents**:
- Project information
- Plugin configuration summary (detailed)
- Step-by-step setup instructions
- GitHub token generation
- AWS S3 bucket creation
- Configuration testing procedures
- GitHub token requirements and scopes
- AWS credentials configuration
- Troubleshooting guide
- Configuration file structure
- Directory structure details
- Support resources

**Size**: 9,298 bytes

**Time to Read**: 15-20 minutes

**Best For**: Comprehensive understanding, troubleshooting

**When to Use**: After QUICK_START.txt for detailed setup

---

### 3. GITHUB_TOKEN_SETUP.md (GitHub-Specific)

**Location**: `/mnt/c/GitHub/fractary/core/GITHUB_TOKEN_SETUP.md`

**Purpose**: GitHub token generation and management guide

**Contents**:
- Quick setup instructions
- Step-by-step token generation
- Setting environment variable options
- Token verification
- Token scope explanations
- Security best practices
- Troubleshooting GitHub auth errors
- SSH setup instructions
- Token management resources
- External links and references

**Size**: 5,736 bytes

**Time to Read**: 10 minutes

**Best For**: GitHub authentication setup

**When to Use**: When setting up GitHub token, or if auth issues occur

---

### 4. FRACTARY_INIT_SUMMARY.txt (Detailed Report)

**Location**: `/mnt/c/GitHub/fractary/core/FRACTARY_INIT_SUMMARY.txt`

**Purpose**: Detailed initialization status report

**Contents**:
- Initialization results summary
- Detailed plugin configuration
- Critical next steps
- File locations listing
- Configuration validation results
- Plugin status matrix
- Environment variables required
- S3 bucket setup instructions
- Quick start commands
- Support documentation references

**Size**: 9,297 bytes

**Time to Read**: 10 minutes

**Best For**: Understanding current status, what was created

**When to Use**: After initialization to understand what happened

---

### 5. FRACTARY_FILES_INDEX.md (This File)

**Location**: `/mnt/c/GitHub/fractary/core/FRACTARY_FILES_INDEX.md`

**Purpose**: Index and description of all Fractary files

**Contents**:
- File locations and descriptions
- File sizes
- Reading times
- Best use cases
- When to read each file

**Time to Read**: 5 minutes

**Best For**: Finding the right documentation

**When to Use**: When unsure which guide to read

---

## Archive Index Files

### .fractary/logs/archive-index.json

**Location**: `/mnt/c/GitHub/fractary/core/.fractary/logs/archive-index.json`

**Purpose**: Metadata index for archived logs

**Format**: JSON

**Contents**:
- version: "1.0"
- last_updated: Timestamp
- total_archived: Count
- entries: Array of archived entries

**Status**: Initialized and ready

---

### .fractary/specs/archive-index.json

**Location**: `/mnt/c/GitHub/fractary/core/.fractary/specs/archive-index.json`

**Purpose**: Metadata index for archived specifications

**Format**: JSON

**Contents**:
- version: "1.0"
- last_updated: Timestamp
- total_archived: Count
- entries: Array of archived entries

**Status**: Initialized and ready

---

## Directory Structure

### .fractary/ Directory

```
.fractary/
├── config.yaml              # Main configuration
├── logs/
│   └── archive-index.json   # Log archive metadata
├── specs/
│   └── archive-index.json   # Spec archive metadata
├── faber/                   # FABER workflow data
└── runs/                    # Workflow run history
```

---

### docs/ Directory

```
docs/
├── architecture/            # Architecture documentation
│   ├── ADR/                 # Architecture Decision Records (auto-numbered)
│   └── designs/             # Design documents
├── guides/                  # User and developer guides
├── schema/                  # Data schema documentation (JSON + Markdown)
├── api/                     # API documentation (OpenAPI generation)
├── standards/               # Project standards
└── operations/
    └── runbooks/            # Operational runbooks
```

---

## File Usage Guide

### For Fastest Onboarding

1. **Start**: QUICK_START.txt (5 min)
2. **Action**: Set GitHub token and create S3 bucket (10 min)
3. **Verify**: Run test commands
4. **Continue**: FRACTARY_SETUP.md if issues occur

**Total Time**: 15-20 minutes

---

### For Complete Understanding

1. **Overview**: FRACTARY_INIT_SUMMARY.txt (10 min)
2. **Setup**: FRACTARY_SETUP.md (20 min)
3. **GitHub**: GITHUB_TOKEN_SETUP.md (10 min)
4. **Reference**: Review .fractary/config.yaml (5 min)

**Total Time**: 45 minutes

---

### For Troubleshooting

1. **Symptoms**: QUICK_START.txt troubleshooting section
2. **GitHub Issues**: GITHUB_TOKEN_SETUP.md troubleshooting
3. **General Issues**: FRACTARY_SETUP.md troubleshooting
4. **Configuration**: Review .fractary/config.yaml

---

## File Sizes Summary

| File | Size | Type |
|------|------|------|
| .fractary/config.yaml | ~8 KB | YAML |
| QUICK_START.txt | 5.2 KB | Text |
| FRACTARY_SETUP.md | 9.3 KB | Markdown |
| GITHUB_TOKEN_SETUP.md | 5.7 KB | Markdown |
| FRACTARY_INIT_SUMMARY.txt | 9.3 KB | Text |
| FRACTARY_FILES_INDEX.md | This file | Markdown |
| .fractary/logs/archive-index.json | 105 B | JSON |
| .fractary/specs/archive-index.json | 105 B | JSON |

**Total Documentation Size**: ~37 KB

---

## Configuration File Structure

The main configuration file (.fractary/config.yaml) is organized as follows:

```yaml
version: "2.0"                  # Version identifier

work:                           # GitHub Issues
  # Configuration for work tracking

repo:                           # GitHub Repository
  # Configuration for repo management

logs:                           # Session Logging
  # Configuration for logging

file:                           # AWS S3 Storage
  # Configuration for cloud storage

codex:                          # Cross-Project
  # Configuration for cross-project access

spec:                           # Specifications
  # Configuration for spec management

docs:                           # Documentation
  # Configuration for documentation
```

---

## Environment Variables

Variables used in configuration:

- `${GITHUB_TOKEN}` - GitHub personal access token (MUST BE SET)
- AWS Profile `default` - Uses ~/.aws/credentials

---

## Next Steps by Role

### For Developers

1. Read: QUICK_START.txt
2. Set: GITHUB_TOKEN
3. Create: S3 bucket
4. Use: fractary-work commands

### For DevOps

1. Read: FRACTARY_SETUP.md
2. Review: AWS S3 configuration
3. Configure: S3 bucket with proper permissions
4. Manage: .fractary/config.yaml

### For Project Managers

1. Read: FRACTARY_SETUP.md
2. Create: GitHub token with appropriate scopes
3. Distribute: Instructions to team
4. Verify: All plugins working

---

## Quick Reference

### To View Configuration
```bash
cat /mnt/c/GitHub/fractary/core/.fractary/config.yaml
```

### To List All Setup Files
```bash
ls -lh /mnt/c/GitHub/fractary/core/FRACTARY_*.* /mnt/c/GitHub/fractary/core/QUICK_START.txt
```

### To View Directory Structure
```bash
tree /mnt/c/GitHub/fractary/core/.fractary/
tree /mnt/c/GitHub/fractary/core/docs/
```

### To Validate Configuration
```bash
python3 -c "import yaml; yaml.safe_load(open('/mnt/c/GitHub/fractary/core/.fractary/config.yaml')); print('Valid')"
```

---

## Support Resources

### Internal Documentation
- Configuration: `.fractary/config.yaml`
- Guides: All FRACTARY_*.md and QUICK_START.txt files
- Archive indexes: `.fractary/logs/archive-index.json` and `.fractary/specs/archive-index.json`

### External Resources
- GitHub Docs: https://docs.github.com
- AWS S3: https://docs.aws.amazon.com/s3/
- GitHub CLI: https://cli.github.com/
- GitHub Tokens: https://github.com/settings/tokens

---

## Version History

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-01-15 | Initial initialization |

---

## File Permissions

All files are readable and properly formatted:
- Configuration: YAML (structured)
- Guides: Markdown/Text (human-readable)
- Archives: JSON (machine-readable)

---

## Additional Notes

- All sensitive values use `${ENV_VAR}` substitution
- AWS credentials are not stored in config (uses local ~/.aws/credentials)
- GitHub token must be set before using work and repo plugins
- S3 bucket must exist before using file plugin
- All paths in configuration use relative paths or ${ENV_VAR}

---

**End of Index**

Generated: 2026-01-15
Project: fractary/core
Configuration Version: 2.0
