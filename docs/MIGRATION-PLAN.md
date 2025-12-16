# Core SDK Migration Plan

## Overview

This document outlines the migration plan for extracting core primitive SDKs from `fractary/faber` and establishing `fractary/core` as the canonical location for primitive operations (work, repo, spec, logs, file, docs).

## Current State Analysis

### fractary/faber Project

**Current exports from @fractary/faber:**
- `work` - Work tracking (GitHub Issues, Jira, Linear)
- `repo` - Repository operations (Git, GitHub, GitLab, Bitbucket)
- `spec` - Specification management
- `logs` - Log management and session capture
- `state` - Workflow state persistence (FABER-specific)
- `workflow` - FABER workflow orchestration (FABER-specific)
- `storage` - Artifact storage with local and Codex integration

**SDK modules in fractary/faber/src:**
```
src/
├── work/           ← PRIMITIVE (migrate to core)
├── repo/           ← PRIMITIVE (migrate to core)
├── spec/           ← PRIMITIVE (migrate to core)
├── logs/           ← PRIMITIVE (migrate to core)
├── storage/        ← PRIMITIVE (migrate as 'file' to core)
├── state/          ← FABER-specific (keep in faber)
├── workflow/       ← FABER-specific (keep in faber)
├── config/         ← FABER-specific (keep in faber)
├── errors/         ← FABER-specific (keep in faber)
└── types/          ← FABER-specific (keep in faber)
```

### fractary/core Project

**Already migrated:**
```
sdk/js/src/
├── work/           ✓ Complete (manager, types, providers: github, jira, linear)
├── repo/           ✓ Complete (manager, git, types, providers: github, gitlab, bitbucket)
├── spec/           ✓ Complete (manager, types, templates, __tests__)
└── logs/           ✓ Complete (manager, types)
```

**Missing SDK implementations:**
- `file/` - File storage operations (to be migrated from storage/)
- `docs/` - Documentation management (new implementation needed)

**Plugin structure:**
```
plugins/
├── work/           ✓ Exists (empty, needs agents/tools/config)
├── repo/           ✓ Exists (empty, needs agents/tools/config)
├── spec/           ✓ Exists (empty, needs agents/tools/config)
├── logs/           ✓ Exists (empty, needs agents/tools/config)
├── file/           ✓ Exists (empty, needs SDK + agents/tools/config)
├── docs/           ✓ Exists (empty, needs SDK + agents/tools/config)
└── status/         ✓ Exists (empty, needs implementation)
```

**Missing infrastructure:**
- No `sdk/js/package.json` (needs to be created)
- No TypeScript build configuration
- No testing infrastructure
- No Python SDK implementation in `sdk/py/`

## Migration Strategy

### Phase 1: Infrastructure Setup

**1.1 Create JavaScript SDK Package Configuration**

Create `sdk/js/package.json`:
```json
{
  "name": "@fractary/core",
  "version": "1.0.0",
  "description": "Fractary Core SDK - Primitive operations for work, repo, spec, logs, file, and docs",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./work": {
      "types": "./dist/work/index.d.ts",
      "default": "./dist/work/index.js"
    },
    "./repo": {
      "types": "./dist/repo/index.d.ts",
      "default": "./dist/repo/index.js"
    },
    "./spec": {
      "types": "./dist/spec/index.d.ts",
      "default": "./dist/spec/index.js"
    },
    "./logs": {
      "types": "./dist/logs/index.d.ts",
      "default": "./dist/logs/index.js"
    },
    "./file": {
      "types": "./dist/file/index.d.ts",
      "default": "./dist/file/index.js"
    },
    "./docs": {
      "types": "./dist/docs/index.d.ts",
      "default": "./dist/docs/index.js"
    }
  }
}
```

**1.2 Create TypeScript Configuration**

Create `sdk/js/tsconfig.json` based on faber's configuration.

**1.3 Create Main Index File**

Create `sdk/js/src/index.ts`:
```typescript
/**
 * @fractary/core - Core Primitives SDK
 *
 * Primitive operations for work tracking, repository management,
 * specifications, logging, file storage, and documentation.
 */

export * from './work';
export * from './repo';
export * from './spec';
export * from './logs';
export * from './file';
export * from './docs';
```

### Phase 2: Complete JavaScript SDK Migration

**2.1 Migrate File/Storage SDK**

Source: `fractary/faber/src/storage/`
Destination: `fractary/core/sdk/js/src/file/`

Tasks:
- Copy `local.ts` → `file/local.ts`
- Copy `codex-adapter.ts` → `file/codex-adapter.ts`
- Create `file/index.ts` with exports
- Create `file/types.ts` for type definitions
- Create `file/manager.ts` for unified file operations

**2.2 Create Docs SDK**

Destination: `fractary/core/sdk/js/src/docs/`

Tasks:
- Create `docs/index.ts`
- Create `docs/manager.ts` for documentation operations
- Create `docs/types.ts` for documentation types
- Consider documentation generation, validation, and storage

**2.3 Verify Existing Migrations**

Verify that the already-copied modules are complete:
- Compare work/ module with faber source
- Compare repo/ module with faber source
- Compare spec/ module with faber source
- Compare logs/ module with faber source
- Ensure all exports are present
- Ensure all tests are copied

### Phase 3: Python SDK Implementation

**3.1 Create Python Package Structure**

```
sdk/py/
├── fractary_core/
│   ├── __init__.py
│   ├── work/
│   │   ├── __init__.py
│   │   ├── manager.py
│   │   ├── types.py
│   │   └── providers/
│   │       ├── __init__.py
│   │       ├── github.py
│   │       ├── jira.py
│   │       └── linear.py
│   ├── repo/
│   │   ├── __init__.py
│   │   ├── manager.py
│   │   ├── git.py
│   │   ├── types.py
│   │   └── providers/
│   │       ├── __init__.py
│   │       ├── github.py
│   │       ├── gitlab.py
│   │       └── bitbucket.py
│   ├── spec/
│   │   ├── __init__.py
│   │   ├── manager.py
│   │   ├── templates.py
│   │   └── types.py
│   ├── logs/
│   │   ├── __init__.py
│   │   ├── manager.py
│   │   └── types.py
│   ├── file/
│   │   ├── __init__.py
│   │   ├── manager.py
│   │   ├── local.py
│   │   ├── codex_adapter.py
│   │   └── types.py
│   └── docs/
│       ├── __init__.py
│       ├── manager.py
│       └── types.py
├── tests/
│   ├── test_work.py
│   ├── test_repo.py
│   ├── test_spec.py
│   ├── test_logs.py
│   ├── test_file.py
│   └── test_docs.py
├── pyproject.toml
├── setup.py
├── README.md
└── LICENSE
```

**3.2 Create pyproject.toml**

```toml
[build-system]
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "fractary-core"
version = "1.0.0"
description = "Fractary Core SDK - Primitive operations for work, repo, spec, logs, file, and docs"
readme = "README.md"
requires-python = ">=3.9"
license = {text = "MIT"}
authors = [
    {name = "Fractary Team", email = "team@fractary.com"}
]
keywords = ["fractary", "workflow", "sdk", "work", "repository", "git"]
classifiers = [
    "Development Status :: 4 - Beta",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.9",
    "Programming Language :: Python :: 3.10",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
]
dependencies = [
    "pydantic>=2.0.0",
    "httpx>=0.24.0",
    "pyyaml>=6.0.0",
]

[project.urls]
Homepage = "https://github.com/fractary/core"
Documentation = "https://docs.fractary.com/core"
Repository = "https://github.com/fractary/core"
```

**3.3 Implement Python SDKs**

Port the TypeScript implementations to Python, maintaining API parity where possible.

### Phase 4: Plugin Configuration

**4.1 Create Plugin Manifests**

For each plugin, create `plugins/{plugin}/plugin.yaml`:

Example for work plugin:
```yaml
name: fractary-work
version: 1.0.0
description: Work item management across GitHub Issues, Jira, and Linear
sdk_dependency:
  package: "@fractary/core"
  version: "^1.0.0"

agents:
  - work-manager

tools:
  - issue-creator
  - issue-fetcher
  - issue-updater
  - comment-creator
  - label-manager
  - milestone-manager
  - state-manager
  - issue-searcher
  - issue-assigner
  - issue-classifier
  - issue-linker
  - comment-lister

configuration:
  schema: ./config/schema.json
  example: ./config/config.example.json
```

**4.2 Update Registry**

Update `plugins/registry.json` to point to `fractary/core` repository:

```json
{
  "name": "fractary-work",
  "repository": "https://github.com/fractary/core",
  "path": "plugins/work",
  "sdk": "@fractary/core"
}
```

### Phase 5: Update Faber Project

**5.1 Update package.json Dependencies**

Add dependency on @fractary/core:
```json
{
  "dependencies": {
    "@fractary/core": "^1.0.0",
    "@fractary/forge": "^1.1.1",
    "commander": "^12.0.0",
    "js-yaml": "^4.1.1",
    "zod": "^3.22.4"
  }
}
```

**5.2 Remove Primitive Code**

Delete from `fractary/faber/src/`:
- `work/`
- `repo/`
- `spec/`
- `logs/`
- `storage/`

**5.3 Update Imports**

Replace imports throughout the codebase:
```typescript
// Old
import { WorkManager } from './work';
import { RepoManager } from './repo';
import { SpecManager } from './spec';
import { LogsManager } from './logs';
import { LocalStorage } from './storage';

// New
import { WorkManager } from '@fractary/core/work';
import { RepoManager } from '@fractary/core/repo';
import { SpecManager } from '@fractary/core/spec';
import { LogsManager } from '@fractary/core/logs';
import { FileManager } from '@fractary/core/file';
```

**5.4 Update package.json Exports**

Remove primitive exports:
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./workflow": {
      "types": "./dist/workflow/index.d.ts",
      "default": "./dist/workflow/index.js"
    },
    "./state": {
      "types": "./dist/state/index.d.ts",
      "default": "./dist/state/index.js"
    }
  }
}
```

**5.5 Update Main Index**

Update `fractary/faber/src/index.ts`:
```typescript
/**
 * @fractary/faber - FABER SDK
 *
 * FABER workflow orchestration and state management.
 * For primitives (work, repo, spec, logs, file, docs), use @fractary/core.
 */

// Core exports (FABER-specific only)
export * from './types';
export * from './errors';
export * from './config';

// Module exports
export * from './state';
export * from './workflow';

// Re-export core primitives for convenience
export * from '@fractary/core';
```

### Phase 6: Testing & Validation

**6.1 Create Test Suite for Core**

Set up testing infrastructure:
- Install Jest and ts-jest
- Create `sdk/js/jest.config.js`
- Port existing tests from faber
- Add integration tests

**6.2 Verify Build Process**

```bash
cd /mnt/c/GitHub/fractary/core/sdk/js
npm run build
npm test
```

**6.3 Verify Faber Integration**

```bash
cd /mnt/c/GitHub/fractary/faber
npm install
npm run build
npm test
```

**6.4 Create Migration Verification Script**

Create a script that verifies:
- All primitive exports from @fractary/core work correctly
- All faber workflows still function
- No broken imports
- All tests pass

## Implementation Checklist

### Infrastructure (Phase 1)
- [ ] Create `sdk/js/package.json`
- [ ] Create `sdk/js/tsconfig.json`
- [ ] Create `sdk/js/jest.config.js`
- [ ] Create `sdk/js/src/index.ts`
- [ ] Create `sdk/js/.eslintrc.js`
- [ ] Create `sdk/js/README.md`

### SDK Migration (Phase 2)
- [ ] Verify work/ module is complete
- [ ] Verify repo/ module is complete
- [ ] Verify spec/ module is complete
- [ ] Verify logs/ module is complete
- [ ] Migrate storage/ → file/
- [ ] Create docs/ module
- [ ] Update all module index exports

### Python SDK (Phase 3)
- [ ] Create `sdk/py/pyproject.toml`
- [ ] Create `sdk/py/setup.py`
- [ ] Create `sdk/py/fractary_core/__init__.py`
- [ ] Implement work module in Python
- [ ] Implement repo module in Python
- [ ] Implement spec module in Python
- [ ] Implement logs module in Python
- [ ] Implement file module in Python
- [ ] Implement docs module in Python
- [ ] Create Python tests
- [ ] Set up Python CI/CD

### Plugin Configuration (Phase 4)
- [ ] Create plugin.yaml for work plugin
- [ ] Create plugin.yaml for repo plugin
- [ ] Create plugin.yaml for spec plugin
- [ ] Create plugin.yaml for logs plugin
- [ ] Create plugin.yaml for file plugin
- [ ] Create plugin.yaml for docs plugin
- [ ] Create plugin.yaml for status plugin
- [ ] Update plugins/registry.json

### Faber Updates (Phase 5)
- [ ] Add @fractary/core dependency to faber
- [ ] Remove primitive code from faber/src
- [ ] Update all imports in faber
- [ ] Update faber package.json exports
- [ ] Update faber/src/index.ts
- [ ] Update faber CLI commands
- [ ] Update faber tests

### Testing & Validation (Phase 6)
- [ ] Core SDK builds successfully
- [ ] Core SDK tests pass
- [ ] Faber builds successfully with core dependency
- [ ] Faber tests pass
- [ ] Integration tests pass
- [ ] Create migration verification script
- [ ] Documentation updated

## Success Criteria

1. **@fractary/core is publishable**
   - Valid package.json with all exports
   - Builds without errors
   - All tests pass
   - Both JS and Python packages work

2. **@fractary/faber depends on @fractary/core**
   - No primitive code remains in faber
   - All imports reference @fractary/core
   - Builds without errors
   - All tests pass

3. **Plugins reference @fractary/core**
   - All plugin.yaml files updated
   - Registry points to correct repository
   - Plugins can be installed and work

4. **No breaking changes for users**
   - Existing faber users can upgrade seamlessly
   - Re-exports maintain backward compatibility
   - Documentation provides migration guide

## Timeline Estimate

- Phase 1 (Infrastructure): 1-2 days
- Phase 2 (SDK Migration): 2-3 days
- Phase 3 (Python SDK): 5-7 days
- Phase 4 (Plugin Config): 1-2 days
- Phase 5 (Faber Updates): 2-3 days
- Phase 6 (Testing): 2-3 days

**Total: 13-20 days**

## Next Steps

1. Review and approve this migration plan
2. Begin Phase 1: Infrastructure Setup
3. Complete SDK migration phase by phase
4. Validate at each phase before proceeding
5. Create comprehensive documentation
6. Publish @fractary/core@1.0.0
7. Update @fractary/faber to depend on core
8. Announce migration to users
