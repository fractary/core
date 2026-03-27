# Repo Plugin Refactoring Specification

**Version**: 2.0.0
**Status**: In Progress
**Started**: 2025-10-29
**Target Completion**: TBD

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Objectives](#objectives)
3. [Current State Analysis](#current-state-analysis)
4. [Architecture Changes](#architecture-changes)
5. [Implementation Phases](#implementation-phases)
6. [File Structure](#file-structure)
7. [Operations Specification](#operations-specification)
8. [Configuration Schema](#configuration-schema)
9. [Handler Pattern](#handler-pattern)
10. [Skills Specification](#skills-specification)
11. [Commands Specification](#commands-specification)
12. [Agent Specification](#agent-specification)
13. [Testing Strategy](#testing-strategy)
14. [Success Criteria](#success-criteria)
15. [Implementation Checklist](#implementation-checklist)

---

## Executive Summary

The **Fractary Repo Plugin** is being refactored from a monolithic single-skill architecture to a modular 3-layer architecture with handler pattern support. This refactoring enables:

1. **Universal Source Control Interface**: Abstract GitHub, GitLab, and Bitbucket behind a common interface
2. **Fine-Grained Skills**: Break down monolithic skill into focused, single-purpose skills
3. **Context Efficiency**: Reduce token usage by 55-60% through handler pattern
4. **User Experience**: Add direct slash commands for interactive use
5. **Extensibility**: Easy addition of new platforms and operations
6. **Standards Compliance**: Align with FRACTARY plugin standards (XML markup, 3-layer architecture)

---

## Objectives

### Primary Goals

1. **Implement Handler Pattern**
   - Abstract platform-specific operations behind common interface
   - Support GitHub (complete), GitLab (stub), Bitbucket (stub)
   - Enable seamless platform switching via configuration

2. **Modular Skill Architecture**
   - Break monolithic `repo-manager` skill into 7 focused skills
   - Each skill handles specific operation domain
   - Reduce context usage per invocation

3. **Add User Commands Layer**
   - Create 6 slash commands for direct user interaction
   - Enable both interactive and programmatic access
   - Maintain backward compatibility with FABER plugin

4. **Expand Operations**
   - Add tag management (create, push tags)
   - Add PR operations (comment, review, approve)
   - Add cleanup operations (list/delete stale branches)

5. **Standards Compliance**
   - Add XML markup to all agents and skills
   - Follow 3-layer architecture pattern
   - Implement proper start/end messaging
   - Add comprehensive error handling

### Secondary Goals

1. Improve documentation and setup guides
2. Create example configurations
3. Enable multi-platform contributions
4. Reduce technical debt from original implementation

---

## Current State Analysis

### Issues with Current Architecture

**File**: `plugins/repo/skills/repo-manager/SKILL.md` (320 lines)
**File**: `plugins/repo/agents/repo-manager.md` (370 lines)

**Problems Identified**:

1. **Agent Contains Bash Code Examples** (lines 55-293 in repo-manager.md)
   - Violates principle: agents should only have decision logic
   - Bash examples should be in skill/workflow files or removed
   - Inflates context window unnecessarily

2. **Monolithic Skill**
   - Single `repo-manager` skill handles ALL operations
   - No separation by concern (branching, committing, PRs, etc.)
   - All platform logic loaded into context every invocation

3. **No Commands Layer**
   - Missing top layer of 3-layer architecture
   - Only callable programmatically by other plugins
   - No direct user interaction

4. **No XML Markup**
   - Missing structured sections (CONTEXT, CRITICAL_RULES, WORKFLOW, etc.)
   - Harder to parse and understand structure
   - Not aligned with FRACTARY standards

5. **No Handler Pattern**
   - Platform scripts organized in subdirectories
   - Selection done via simple directory switching
   - All platform logic visible in single skill file

### What Works Well

1. **GitHub Scripts Are Complete**
   - 6 well-written, deterministic scripts
   - Good error handling with defined exit codes
   - Proper safety checks (protected branches, force-push, etc.)
   - Semantic conventions (branch naming, commit format)

2. **Foundation for Multi-Platform**
   - Directory structure ready (github/, gitlab/, bitbucket/)
   - Script interface consistent
   - Configuration system in place

3. **Integration with FABER**
   - Used successfully by FABER workflow
   - Proper metadata handling
   - Work item tracking integration

---

## Architecture Changes

### From: Current State

```
plugins/repo/
├── .claude-plugin/plugin.json
├── README.md
├── agents/
│   └── repo-manager.md              # 370 lines, contains bash examples
└── skills/
    └── repo-manager/                # Monolithic skill
        ├── SKILL.md                 # 320 lines
        ├── docs/
        │   ├── github-git.md
        │   └── gitlab-git.md
        └── scripts/
            ├── github/              # Complete (6 scripts)
            ├── gitlab/              # Empty
            └── bitbucket/           # Empty
```

**Context Usage**: ~690 lines per invocation (agent + skill always loaded)

### To: Target State

```
plugins/repo/
├── .claude-plugin/plugin.json
├── README.md
├── config/
│   └── repo.example.json            # NEW: Configuration template
├── docs/
│   ├── spec/
│   │   └── repo-plugin-refactoring-spec.md  # NEW: This document
│   └── setup/
│       ├── github-setup.md          # NEW: GitHub setup guide
│       ├── gitlab-setup.md          # NEW: GitLab setup guide
│       └── bitbucket-setup.md       # NEW: Bitbucket setup guide
├── commands/                        # NEW: User-facing commands
│   ├── branch.md
│   ├── commit.md
│   ├── push.md
│   ├── pr.md
│   ├── tag.md
│   └── cleanup.md
├── agents/
│   └── repo-manager.md              # REFACTORED: Decision logic only, XML markup
└── skills/
    ├── repo-common/                 # NEW: Shared utilities
    │   ├── SKILL.md
    │   ├── scripts/
    │   │   ├── config-loader.sh
    │   │   ├── branch-validator.sh
    │   │   ├── commit-validator.sh
    │   │   ├── pr-formatter.sh
    │   │   └── metadata-extractor.sh
    │   ├── templates/
    │   │   ├── pr-body.md
    │   │   └── commit-message.md
    │   └── lib/
    │       └── common.sh
    ├── branch-namer/                # NEW: Fine-grained skill
    │   └── SKILL.md
    ├── branch-manager/              # NEW: Fine-grained skill
    │   └── SKILL.md
    ├── commit-creator/              # NEW: Fine-grained skill
    │   └── SKILL.md
    ├── branch-pusher/               # NEW: Fine-grained skill
    │   └── SKILL.md
    ├── pr-manager/                  # NEW: Fine-grained skill
    │   └── SKILL.md
    ├── tag-manager/                 # NEW: Fine-grained skill
    │   └── SKILL.md
    ├── cleanup-manager/             # NEW: Fine-grained skill
    │   └── SKILL.md
    ├── handler-source-control-github/      # NEW: GitHub handler
    │   ├── SKILL.md
    │   ├── scripts/
    │   │   ├── generate-branch-name.sh     # Moved from repo-manager
    │   │   ├── create-branch.sh
    │   │   ├── delete-branch.sh            # NEW
    │   │   ├── create-commit.sh
    │   │   ├── push-branch.sh
    │   │   ├── create-pr.sh
    │   │   ├── comment-pr.sh               # NEW
    │   │   ├── review-pr.sh                # NEW
    │   │   ├── merge-pr.sh
    │   │   ├── create-tag.sh               # NEW
    │   │   ├── push-tag.sh                 # NEW
    │   │   └── list-stale-branches.sh      # NEW
    │   └── docs/
    │       └── github-setup.md
    ├── handler-source-control-gitlab/      # NEW: GitLab handler (stub)
    │   ├── SKILL.md
    │   ├── scripts/                        # Empty (future implementation)
    │   └── docs/
    │       └── gitlab-setup.md
    └── handler-source-control-bitbucket/   # NEW: Bitbucket handler (stub)
        ├── SKILL.md
        ├── scripts/                        # Empty (future implementation)
        └── docs/
            └── bitbucket-setup.md
```

**Context Usage**: ~200-300 lines per invocation (command + agent + 1 skill + 1 handler)
**Savings**: 55-60% context reduction

---

## Implementation Phases

### Phase 1: Handler Infrastructure Setup ✅ COMPLETE

**Goal**: Create handler pattern structure and move existing scripts

**Tasks**:
1. ✅ Create handler skill directories for all 3 platforms
2. ✅ Create `handler-source-control-github/SKILL.md` with operations interface
3. ✅ Create `handler-source-control-gitlab/SKILL.md` stub
4. ✅ Create `handler-source-control-bitbucket/SKILL.md` stub
5. ✅ Move GitHub scripts from `repo-manager/scripts/github/` to handler
6. ✅ Create `repo-common/SKILL.md` with utility specifications

**Deliverables**:
- Handler directory structure
- GitHub handler fully documented (13 operations)
- GitLab/Bitbucket handler stubs with contribution guidelines
- Repo-common utilities defined

**Files Created**:
- `skills/handler-source-control-github/SKILL.md` (comprehensive)
- `skills/handler-source-control-gitlab/SKILL.md` (stub)
- `skills/handler-source-control-bitbucket/SKILL.md` (stub)
- `skills/repo-common/SKILL.md` (utilities spec)

---

### Phase 2: Fine-Grained Skills

**Goal**: Break monolithic skill into focused, single-purpose skills

**Tasks**:
1. ⏳ Create `branch-namer` skill
2. ⏳ Create `branch-manager` skill
3. ⏳ Create `commit-creator` skill
4. ⏳ Create `branch-pusher` skill
5. ⏳ Create `pr-manager` skill
6. ⏳ Create `tag-manager` skill
7. ⏳ Create `cleanup-manager` skill

**Requirements for Each Skill**:
- XML markup structure (CONTEXT, CRITICAL_RULES, WORKFLOW, etc.)
- Start/end message templates
- Handler invocation logic
- Configuration reading
- Structured JSON responses
- Error handling

**Skill Details**: See [Skills Specification](#skills-specification) section

---

### Phase 3: Refactor Agent

**Goal**: Simplify agent to decision logic only, add XML markup

**Tasks**:
1. ⏳ Remove all bash code examples from agent file
2. ⏳ Add XML markup structure
3. ⏳ Focus on decision logic (which skill to call, validation)
4. ⏳ Add proper error handling and routing
5. ⏳ Update to use fine-grained skills instead of monolithic skill

**Agent Responsibilities** (after refactoring):
- Parse operation requests from FABER or other plugins
- Validate inputs
- Determine which skill to invoke
- Route to appropriate skill
- Handle skill responses
- Return structured responses to caller

**Agent Should NOT**:
- Contain bash code examples
- Execute scripts directly
- Know about platform specifics
- Have workflow logic (that's for skills)

---

### Phase 4: User Commands Layer

**Goal**: Add slash commands for direct user interaction

**Tasks**:
1. ⏳ Create `/fractary-repo-branch` command
2. ⏳ Create `/fractary-repo-commit` command
3. ⏳ Create `/fractary-repo-push` command
4. ⏳ Create `/fractary-repo-pr` command
5. ⏳ Create `/fractary-repo-tag` command
6. ⏳ Create `/fractary-repo-cleanup` command

**Command Requirements**:
- Parse user arguments
- Validate inputs
- Invoke repo-manager agent
- Display results to user
- Handle errors gracefully

**Command Details**: See [Commands Specification](#commands-specification) section

---

### Phase 5: Configuration Schema

**Goal**: Create configuration structure and example files

**Tasks**:
1. ⏳ Create `config/repo.example.json` with schema
2. ⏳ Document configuration options
3. ⏳ Add configuration validation to repo-common

**Configuration Details**: See [Configuration Schema](#configuration-schema) section

---

### Phase 6: New Operations Implementation

**Goal**: Implement 7 new operations for GitHub handler

**Tasks**:

**Tag Operations**:
1. ⏳ Implement `create-tag.sh` (GitHub)
2. ⏳ Implement `push-tag.sh` (GitHub)

**PR Operations**:
3. ⏳ Implement `comment-pr.sh` (GitHub)
4. ⏳ Implement `review-pr.sh` (GitHub)

**Cleanup Operations**:
5. ⏳ Implement `list-stale-branches.sh` (GitHub)
6. ⏳ Implement `delete-branch.sh` (GitHub)

**Script Requirements**:
- Follow existing script patterns
- Comprehensive error handling
- Proper exit codes
- JSON output where appropriate
- Safety checks (protected branches, etc.)

---

### Phase 7: Documentation & Standards

**Goal**: Complete documentation and setup guides

**Tasks**:
1. ⏳ Update `README.md` with new architecture overview
2. ⏳ Create `docs/setup/github-setup.md`
3. ⏳ Create `docs/setup/gitlab-setup.md`
4. ⏳ Create `docs/setup/bitbucket-setup.md`
5. ⏳ Create migration guide for existing users
6. ⏳ Delete old monolithic `repo-manager` skill

---

## File Structure

### Complete File Tree (Target)

```
plugins/repo/
├── .claude-plugin/
│   └── plugin.json                 # Plugin manifest
├── README.md                       # Updated with new architecture
├── config/
│   └── repo.example.json           # Configuration template
├── docs/
│   ├── spec/
│   │   └── repo-plugin-refactoring-spec.md  # This document
│   ├── setup/
│   │   ├── github-setup.md         # GitHub configuration guide
│   │   ├── gitlab-setup.md         # GitLab configuration guide
│   │   └── bitbucket-setup.md      # Bitbucket configuration guide
│   └── migration.md                # Migration guide from v1.x
├── commands/
│   ├── branch.md                   # /fractary-repo-branch command
│   ├── commit.md                   # /fractary-repo-commit command
│   ├── push.md                     # /fractary-repo-push command
│   ├── pr.md                       # /fractary-repo-pr command
│   ├── tag.md                      # /fractary-repo-tag command
│   └── cleanup.md                  # /fractary-repo-cleanup command
├── agents/
│   └── repo-manager.md             # Refactored agent (decision logic only)
└── skills/
    ├── repo-common/
    │   ├── SKILL.md
    │   ├── scripts/
    │   │   ├── config-loader.sh
    │   │   ├── branch-validator.sh
    │   │   ├── commit-validator.sh
    │   │   ├── pr-formatter.sh
    │   │   └── metadata-extractor.sh
    │   ├── templates/
    │   │   ├── pr-body.md
    │   │   └── commit-message.md
    │   └── lib/
    │       └── common.sh
    ├── branch-namer/
    │   └── SKILL.md
    ├── branch-manager/
    │   └── SKILL.md
    ├── commit-creator/
    │   └── SKILL.md
    ├── branch-pusher/
    │   └── SKILL.md
    ├── pr-manager/
    │   └── SKILL.md
    ├── tag-manager/
    │   └── SKILL.md
    ├── cleanup-manager/
    │   └── SKILL.md
    ├── handler-source-control-github/
    │   ├── SKILL.md
    │   ├── scripts/
    │   │   ├── generate-branch-name.sh
    │   │   ├── create-branch.sh
    │   │   ├── delete-branch.sh
    │   │   ├── create-commit.sh
    │   │   ├── push-branch.sh
    │   │   ├── create-pr.sh
    │   │   ├── comment-pr.sh
    │   │   ├── review-pr.sh
    │   │   ├── merge-pr.sh
    │   │   ├── create-tag.sh
    │   │   ├── push-tag.sh
    │   │   └── list-stale-branches.sh
    │   └── docs/
    │       └── github-setup.md
    ├── handler-source-control-gitlab/
    │   ├── SKILL.md
    │   ├── scripts/
    │   └── docs/
    │       └── gitlab-setup.md
    └── handler-source-control-bitbucket/
        ├── SKILL.md
        ├── scripts/
        └── docs/
            └── bitbucket-setup.md
```

### File Count Summary

**New Files**: ~40
- 6 commands
- 7 fine-grained skills
- 3 handlers (1 complete, 2 stubs)
- 1 common utilities skill
- 1 configuration file
- 7 new scripts (GitHub)
- 5 utility scripts (repo-common)
- 4 documentation files
- 1 specification file (this document)

**Modified Files**: 2
- `agents/repo-manager.md` (refactored)
- `README.md` (updated)

**Moved Files**: 6
- GitHub scripts moved to handler

**Deleted Files**: 1
- Old monolithic `skills/repo-manager/` (after migration complete)

---

## Operations Specification

### Operation Categories

All operations are organized into 6 categories:

1. **Branch Operations** - Create, delete, name branches
2. **Commit Operations** - Create semantic commits
3. **Push Operations** - Push branches to remote
4. **PR Operations** - Create, comment, review, merge PRs
5. **Tag Operations** - Create and push version tags
6. **Cleanup Operations** - List and delete stale branches

### Complete Operations List (13 Total)

| # | Operation | Category | GitHub | GitLab | Bitbucket | Skill | Handler Script |
|---|-----------|----------|---------|--------|-----------|-------|----------------|
| 1 | generate-branch-name | Branch | ✅ | 🚧 | 🚧 | branch-namer | generate-branch-name.sh |
| 2 | create-branch | Branch | ✅ | 🚧 | 🚧 | branch-manager | create-branch.sh |
| 3 | delete-branch | Branch | ⏳ | 🚧 | 🚧 | cleanup-manager | delete-branch.sh |
| 4 | create-commit | Commit | ✅ | 🚧 | 🚧 | commit-creator | create-commit.sh |
| 5 | push-branch | Push | ✅ | 🚧 | 🚧 | branch-pusher | push-branch.sh |
| 6 | create-pr | PR | ✅ | 🚧 | 🚧 | pr-manager | create-pr.sh |
| 7 | comment-pr | PR | ⏳ | 🚧 | 🚧 | pr-manager | comment-pr.sh |
| 8 | review-pr | PR | ⏳ | 🚧 | 🚧 | pr-manager | review-pr.sh |
| 9 | merge-pr | PR | ✅ | 🚧 | 🚧 | pr-manager | merge-pr.sh |
| 10 | create-tag | Tag | ⏳ | 🚧 | 🚧 | tag-manager | create-tag.sh |
| 11 | push-tag | Tag | ⏳ | 🚧 | 🚧 | tag-manager | push-tag.sh |
| 12 | list-stale-branches | Cleanup | ⏳ | 🚧 | 🚧 | cleanup-manager | list-stale-branches.sh |

Legend: ✅ Complete | ⏳ In Progress | 🚧 Not Implemented

### Operation Details

#### 1. generate-branch-name

**Purpose**: Create semantic branch name from work item metadata

**Parameters**:
- `prefix` - Branch prefix (feat|fix|chore|hotfix|docs|test|refactor|style|perf)
- `issue_id` - Work item ID
- `description` - Brief description for slug

**Output**:
```json
{
  "status": "success",
  "branch_name": "feat/123-add-user-export-feature"
}
```

**Skill**: `branch-namer`
**Handler Script**: `generate-branch-name.sh`

---

#### 2. create-branch

**Purpose**: Create new Git branch locally

**Parameters**:
- `branch_name` - Name of branch to create
- `base_branch` - Base branch to branch from (default: main)

**Output**:
```json
{
  "status": "success",
  "branch_name": "feat/123-add-export",
  "base_branch": "main",
  "commit_sha": "abc123..."
}
```

**Skill**: `branch-manager`
**Handler Script**: `create-branch.sh`

---

#### 3. delete-branch

**Purpose**: Delete Git branch locally and/or remotely

**Parameters**:
- `branch_name` - Branch to delete
- `location` - Where to delete (local|remote|both)
- `force` - Force deletion even if not fully merged (boolean)

**Safety**:
- NEVER allow deletion of protected branches
- Warn if branch has unmerged commits

**Output**:
```json
{
  "status": "success",
  "branch_name": "feat/123-add-export",
  "deleted_local": true,
  "deleted_remote": true
}
```

**Skill**: `cleanup-manager`
**Handler Script**: `delete-branch.sh` (NEW)

---

#### 4. create-commit

**Purpose**: Create semantic commit with FABER metadata

**Parameters**:
- `message` - Commit message
- `type` - Commit type (feat|fix|chore|docs|test|refactor|style|perf)
- `work_id` - Work item reference
- `author_context` - FABER context (architect|implementor|tester|reviewer)
- `description` - Optional extended description

**Format**: Conventional Commits + FABER metadata

**Output**:
```json
{
  "status": "success",
  "commit_sha": "abc123def456...",
  "message": "feat: Add user export to CSV functionality",
  "work_id": "#123"
}
```

**Skill**: `commit-creator`
**Handler Script**: `create-commit.sh`

---

#### 5. push-branch

**Purpose**: Push branch to remote repository

**Parameters**:
- `branch_name` - Branch to push
- `remote` - Remote name (default: origin)
- `set_upstream` - Set as tracking branch (boolean)
- `force` - Force push with lease (boolean)

**Safety**: Uses `--force-with-lease` instead of `--force`

**Output**:
```json
{
  "status": "success",
  "branch_name": "feat/123-add-export",
  "remote": "origin",
  "upstream_set": true
}
```

**Skill**: `branch-pusher`
**Handler Script**: `push-branch.sh`

---

#### 6. create-pr

**Purpose**: Create pull request

**Parameters**:
- `title` - PR title
- `body` - PR description (markdown)
- `base_branch` - Target branch (default: main)
- `head_branch` - Source branch
- `work_id` - Work item to close

**Features**:
- Auto-generates PR body with FABER metadata
- Includes "closes #{work_id}" reference

**Output**:
```json
{
  "status": "success",
  "pr_number": 456,
  "pr_url": "https://github.com/owner/repo/pull/456",
  "base_branch": "main",
  "head_branch": "feat/123-add-export"
}
```

**Skill**: `pr-manager`
**Handler Script**: `create-pr.sh`

---

#### 7. comment-pr

**Purpose**: Add comment to pull request

**Parameters**:
- `pr_number` - PR number
- `comment` - Comment text (markdown)

**Output**:
```json
{
  "status": "success",
  "pr_number": 456,
  "comment_id": 789,
  "comment_url": "https://github.com/owner/repo/pull/456#issuecomment-789"
}
```

**Skill**: `pr-manager`
**Handler Script**: `comment-pr.sh` (NEW)

---

#### 8. review-pr

**Purpose**: Submit PR review (approve, request changes, comment)

**Parameters**:
- `pr_number` - PR number
- `action` - Review action (approve|request_changes|comment)
- `body` - Review comment (markdown)

**Output**:
```json
{
  "status": "success",
  "pr_number": 456,
  "review_id": 890,
  "action": "approve"
}
```

**Skill**: `pr-manager`
**Handler Script**: `review-pr.sh` (NEW)

---

#### 9. merge-pr

**Purpose**: Merge pull request with specified strategy

**Parameters**:
- `pr_number` - PR number or branch name
- `merge_strategy` - Merge strategy (no-ff|squash|ff-only)
- `delete_branch` - Delete branch after merge (boolean)

**Safety**:
- Warns if merging to protected branch
- Checks CI status before merge

**Output**:
```json
{
  "status": "success",
  "pr_number": 456,
  "merge_sha": "abc123...",
  "strategy": "no-ff",
  "branch_deleted": true
}
```

**Skill**: `pr-manager`
**Handler Script**: `merge-pr.sh`

---

#### 10. create-tag

**Purpose**: Create semantic version tag

**Parameters**:
- `tag_name` - Tag name (e.g., "v1.2.3")
- `message` - Tag annotation message
- `commit_sha` - Commit to tag (default: HEAD)
- `sign` - GPG sign the tag (boolean)

**Output**:
```json
{
  "status": "success",
  "tag_name": "v1.2.3",
  "commit_sha": "abc123...",
  "signed": false
}
```

**Skill**: `tag-manager`
**Handler Script**: `create-tag.sh` (NEW)

---

#### 11. push-tag

**Purpose**: Push tags to remote repository

**Parameters**:
- `tag_name` - Specific tag to push (or "all" for all tags)
- `remote` - Remote name (default: origin)

**Output**:
```json
{
  "status": "success",
  "tag_name": "v1.2.3",
  "remote": "origin"
}
```

**Skill**: `tag-manager`
**Handler Script**: `push-tag.sh` (NEW)

---

#### 12. list-stale-branches

**Purpose**: Find branches that are merged or inactive

**Parameters**:
- `merged` - Include merged branches (boolean)
- `inactive_days` - Include branches with no commits in N days
- `exclude_protected` - Exclude protected branches (boolean, default: true)

**Output**:
```json
{
  "status": "success",
  "stale_branches": [
    {
      "name": "feat/old-feature",
      "last_commit_date": "2024-09-15",
      "merged": true,
      "days_inactive": 45
    }
  ],
  "count": 1
}
```

**Skill**: `cleanup-manager`
**Handler Script**: `list-stale-branches.sh` (NEW)

---

## Configuration Schema

### Configuration File Locations

Configuration files are searched in the following order:

1. `.fractary/config.yaml` (project-specific)
2. `~/.fractary/repo/config.json` (user-global)
3. Plugin defaults (built-in)

### JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Fractary Repo Plugin Configuration",
  "type": "object",
  "properties": {
    "handlers": {
      "type": "object",
      "properties": {
        "source_control": {
          "type": "object",
          "properties": {
            "active": {
              "type": "string",
              "enum": ["github", "gitlab", "bitbucket"],
              "description": "Active source control platform"
            },
            "github": {
              "type": "object",
              "properties": {
                "token": {
                  "type": "string",
                  "description": "GitHub token (use $GITHUB_TOKEN for env var)"
                },
                "api_url": {
                  "type": "string",
                  "default": "https://api.github.com",
                  "description": "GitHub API endpoint"
                }
              }
            },
            "gitlab": {
              "type": "object",
              "properties": {
                "token": {
                  "type": "string",
                  "description": "GitLab token (use $GITLAB_TOKEN for env var)"
                },
                "api_url": {
                  "type": "string",
                  "default": "https://gitlab.com/api/v4",
                  "description": "GitLab API endpoint"
                }
              }
            },
            "bitbucket": {
              "type": "object",
              "properties": {
                "username": {
                  "type": "string",
                  "description": "Bitbucket username"
                },
                "token": {
                  "type": "string",
                  "description": "Bitbucket app password (use $BITBUCKET_TOKEN for env var)"
                },
                "workspace": {
                  "type": "string",
                  "description": "Bitbucket workspace slug"
                },
                "api_url": {
                  "type": "string",
                  "default": "https://api.bitbucket.org/2.0",
                  "description": "Bitbucket API endpoint"
                }
              }
            }
          },
          "required": ["active"]
        }
      }
    },
    "defaults": {
      "type": "object",
      "properties": {
        "default_branch": {
          "type": "string",
          "default": "main",
          "description": "Default base branch for new branches"
        },
        "protected_branches": {
          "type": "array",
          "items": {"type": "string"},
          "default": ["main", "master", "production"],
          "description": "Branches that require extra protection"
        },
        "branch_naming": {
          "type": "string",
          "default": "feat/{issue_id}-{slug}",
          "description": "Branch naming pattern"
        },
        "commit_format": {
          "type": "string",
          "enum": ["conventional", "faber"],
          "default": "faber",
          "description": "Commit message format"
        },
        "require_signed_commits": {
          "type": "boolean",
          "default": false,
          "description": "Require GPG-signed commits"
        },
        "merge_strategy": {
          "type": "string",
          "enum": ["no-ff", "squash", "ff-only"],
          "default": "no-ff",
          "description": "Default merge strategy"
        },
        "auto_delete_merged_branches": {
          "type": "boolean",
          "default": false,
          "description": "Automatically delete branches after merge"
        }
      }
    }
  },
  "required": ["handlers"]
}
```

### Example Configuration (config/repo.example.json)

```json
{
  "handlers": {
    "source_control": {
      "active": "github",
      "github": {
        "token": "$GITHUB_TOKEN",
        "api_url": "https://api.github.com"
      },
      "gitlab": {
        "token": "$GITLAB_TOKEN",
        "api_url": "https://gitlab.com/api/v4"
      },
      "bitbucket": {
        "username": "$BITBUCKET_USERNAME",
        "token": "$BITBUCKET_TOKEN",
        "workspace": "your-workspace",
        "api_url": "https://api.bitbucket.org/2.0"
      }
    }
  },
  "defaults": {
    "default_branch": "main",
    "protected_branches": ["main", "master", "production", "staging"],
    "branch_naming": "feat/{issue_id}-{slug}",
    "commit_format": "faber",
    "require_signed_commits": false,
    "merge_strategy": "no-ff",
    "auto_delete_merged_branches": false
  }
}
```

### Default Configuration (Built-In)

If no configuration file is found, these defaults are used:

```json
{
  "handlers": {
    "source_control": {
      "active": "github",
      "github": {
        "token": "$GITHUB_TOKEN",
        "api_url": "https://api.github.com"
      }
    }
  },
  "defaults": {
    "default_branch": "main",
    "protected_branches": ["main", "master", "production"],
    "branch_naming": "feat/{issue_id}-{slug}",
    "commit_format": "faber",
    "require_signed_commits": false,
    "merge_strategy": "no-ff",
    "auto_delete_merged_branches": false
  }
}
```

---

## Handler Pattern

### Overview

The handler pattern enables platform-agnostic operations by:

1. **Defining a standard interface** for all operations
2. **Implementing platform-specific handlers** that conform to the interface
3. **Configuration-driven selection** of active handler
4. **Loading only the active handler** into context (context efficiency)

### Three Components

1. **Core Skills** - Orchestrate operations, invoke handlers
2. **Handler Skills** - Implement platform-specific operations
3. **Configuration** - Determines which handler is active

### Handler Interface

All handlers must implement the same 13 operations with consistent:
- Parameter names and types
- Response format (JSON)
- Error codes
- Safety checks

### Handler Invocation Pattern

```
Core Skill (e.g., branch-manager)
    ↓
1. Load configuration
2. Determine active handler: config.handlers.source_control.active
3. Invoke: USE SKILL handler-source-control-{active}
4. Pass operation and parameters
5. Receive structured response
6. Process and return to caller
```

### Handler Response Format

All handlers return standardized JSON:

```json
{
  "status": "success|failure",
  "operation": "operation_name",
  "platform": "github|gitlab|bitbucket",
  "result": {
    // Operation-specific result data
  },
  "message": "Human-readable description",
  "error": "Error details if status=failure",
  "error_code": 0  // Numeric error code if failure
}
```

### Handler Metadata

Each handler declares:

```markdown
<HANDLER_METADATA>
**Platform**: GitHub|GitLab|Bitbucket
**Version**: 1.0.0
**Protocol Version**: source-control-handler-v1
**Supported Operations**: 13/13 implemented (or X/13)
**CLI Dependencies**: List of required tools
**Authentication**: Method and environment variables
**API Rate Limits**: Platform-specific limits
</HANDLER_METADATA>
```

### Platform Support Matrix

| Platform | Status | CLI Tool | Auth Method | Operations |
|----------|--------|----------|-------------|------------|
| GitHub | ✅ Complete | `gh`, `git` | `GITHUB_TOKEN` | 13/13 (6 existing + 7 new) |
| GitLab | 🚧 Stub | `glab`, `git` | `GITLAB_TOKEN` | 0/13 |
| Bitbucket | 🚧 Stub | `curl`, `git` | `BITBUCKET_TOKEN` | 0/13 |

---

## Skills Specification

### Skill: branch-namer

**Purpose**: Generate semantic branch names from work item metadata

**Invoked By**:
- `repo-manager` agent
- `/fractary-repo-branch create` command

**Operations**:
- `generate-branch-name`

**Handler Invocation**: Yes (invokes active source control handler)

**XML Sections**:
- CONTEXT - Skill description and responsibility
- CRITICAL_RULES - Branch naming conventions, validation rules
- INPUTS - work_id, type, description
- WORKFLOW - Load config → validate → invoke handler → return
- OUTPUTS - Structured JSON with branch_name
- ERROR_HANDLING - Invalid inputs, handler errors
- DOCUMENTATION - Start/end messages

**Start Message**:
```
🎯 STARTING: Branch Name Generator
Work ID: {work_id}
Type: {type}
───────────────────────────────────────
```

**End Message**:
```
✅ COMPLETED: Branch Name Generator
Branch Name: {branch_name}
───────────────────────────────────────
Next: Create branch with branch-manager skill
```

---

### Skill: branch-manager

**Purpose**: Create, delete, and manage Git branches

**Invoked By**:
- `repo-manager` agent
- `/fractary-repo-branch` command

**Operations**:
- `create-branch`
- `delete-branch` (future, currently in cleanup-manager)

**Handler Invocation**: Yes

**XML Sections**:
- CONTEXT
- CRITICAL_RULES - Protected branch checks, validation
- INPUTS - branch_name, base_branch, operation
- WORKFLOW - Validate → check protected → invoke handler → confirm
- OUTPUTS - Branch details (name, sha, status)
- ERROR_HANDLING - Branch exists, protected branch, handler errors
- DOCUMENTATION

**Start Message**:
```
🎯 STARTING: Branch Manager
Operation: {operation}
Branch: {branch_name}
───────────────────────────────────────
```

---

### Skill: commit-creator

**Purpose**: Create semantic commits with FABER metadata

**Invoked By**:
- `repo-manager` agent
- `/fractary-repo-commit` command

**Operations**:
- `create-commit`

**Handler Invocation**: Yes

**XML Sections**:
- CONTEXT
- CRITICAL_RULES - Conventional commits format, FABER metadata
- INPUTS - message, type, work_id, author_context
- WORKFLOW - Validate message → format → invoke handler → return sha
- OUTPUTS - Commit SHA, formatted message
- ERROR_HANDLING - Invalid type, no changes, handler errors
- DOCUMENTATION

**Start Message**:
```
🎯 STARTING: Commit Creator
Type: {type}
Message: {message}
───────────────────────────────────────
```

---

### Skill: branch-pusher

**Purpose**: Push branches to remote repository

**Invoked By**:
- `repo-manager` agent
- `/fractary-repo-push` command

**Operations**:
- `push-branch`

**Handler Invocation**: Yes

**XML Sections**:
- CONTEXT
- CRITICAL_RULES - Force push safety, protected branch checks
- INPUTS - branch_name, remote, set_upstream, force
- WORKFLOW - Validate → check protected → invoke handler → confirm
- OUTPUTS - Push status, upstream info
- ERROR_HANDLING - Protected branch force push, network errors
- DOCUMENTATION

**Start Message**:
```
🎯 STARTING: Branch Pusher
Branch: {branch_name}
Remote: {remote}
───────────────────────────────────────
```

---

### Skill: pr-manager

**Purpose**: Create, comment, review, approve, and merge pull requests

**Invoked By**:
- `repo-manager` agent
- `/fractary-repo-pr` command

**Operations**:
- `create-pr`
- `comment-pr`
- `review-pr`
- `merge-pr`

**Handler Invocation**: Yes

**XML Sections**:
- CONTEXT
- CRITICAL_RULES - PR body format, merge to protected branch warnings
- INPUTS - Operation-specific (title, body, pr_number, action, etc.)
- WORKFLOW - Route by operation → format body → invoke handler → return URL
- OUTPUTS - PR number, URL, status
- ERROR_HANDLING - PR not found, merge conflicts, CI failures
- DOCUMENTATION

**Start Message**:
```
🎯 STARTING: PR Manager
Operation: {operation}
PR: #{pr_number or "new"}
───────────────────────────────────────
```

---

### Skill: tag-manager

**Purpose**: Create and push semantic version tags

**Invoked By**:
- `repo-manager` agent
- `/fractary-repo-tag` command

**Operations**:
- `create-tag`
- `push-tag`

**Handler Invocation**: Yes

**XML Sections**:
- CONTEXT
- CRITICAL_RULES - Semantic versioning format, GPG signing
- INPUTS - tag_name, message, commit_sha, sign
- WORKFLOW - Validate version → create tag → optionally push → confirm
- OUTPUTS - Tag name, commit SHA, signed status
- ERROR_HANDLING - Tag exists, invalid format, signing errors
- DOCUMENTATION

**Start Message**:
```
🎯 STARTING: Tag Manager
Operation: {operation}
Tag: {tag_name}
───────────────────────────────────────
```

---

### Skill: cleanup-manager

**Purpose**: List and delete stale branches

**Invoked By**:
- `repo-manager` agent
- `/fractary-repo-cleanup` command

**Operations**:
- `list-stale-branches`
- `delete-branch`

**Handler Invocation**: Yes

**XML Sections**:
- CONTEXT
- CRITICAL_RULES - NEVER delete protected branches, confirm before deletion
- INPUTS - Operation, filters (merged, inactive_days)
- WORKFLOW - List stale → filter → optionally delete → confirm
- OUTPUTS - List of stale branches or deletion status
- ERROR_HANDLING - Protected branch attempted, network errors
- DOCUMENTATION

**Start Message**:
```
🎯 STARTING: Cleanup Manager
Operation: {operation}
Filters: {filters}
───────────────────────────────────────
```

---

## Commands Specification

### Command: /fractary-repo-branch

**Purpose**: Manage Git branches (create, delete, list)

**Syntax**:
```
/fractary-repo-branch create <issue_id> <description> [--base <branch>]
/fractary-repo-branch delete <branch_name> [--location local|remote|both] [--force]
/fractary-repo-branch list [--stale] [--merged]
```

**Examples**:
```
/fractary-repo-branch create 123 "add user export feature"
/fractary-repo-branch create 456 "fix login bug" --base develop
/fractary-repo-branch delete feat/old-feature --location both
/fractary-repo-branch list --stale --merged
```

**Workflow**:
1. Parse arguments
2. Validate inputs
3. Invoke `repo-manager` agent with operation
4. Display results to user

---

### Command: /fractary-repo-commit

**Purpose**: Create semantic commits with FABER metadata

**Syntax**:
```
/fractary-repo-commit <message> --type <type> [--work-id <id>] [--context <context>]
```

**Examples**:
```
/fractary-repo-commit "Add CSV export functionality" --type feat --work-id 123
/fractary-repo-commit "Fix authentication bug" --type fix --work-id 456 --context implementor
```

**Workflow**:
1. Parse arguments
2. Validate commit message and type
3. Invoke `repo-manager` agent
4. Display commit SHA to user

---

### Command: /fractary-repo-push

**Purpose**: Push branches to remote repository

**Syntax**:
```
/fractary-repo-push [<branch>] [--remote <remote>] [--set-upstream] [--force]
```

**Examples**:
```
/fractary-repo-push
/fractary-repo-push feat/123-add-export --set-upstream
/fractary-repo-push feat/456-fix-bug --force
```

**Workflow**:
1. Parse arguments (default to current branch)
2. Validate not pushing to protected with force
3. Invoke `repo-manager` agent
4. Display push status

---

### Command: /fractary-repo-pr

**Purpose**: Manage pull requests (create, comment, review, merge)

**Syntax**:
```
/fractary-repo-pr create <title> [--body <description>] [--base <branch>] [--work-id <id>]
/fractary-repo-pr comment <pr_number> <comment>
/fractary-repo-pr review <pr_number> <action> [--comment <text>]
/fractary-repo-pr merge <pr_number> [--strategy <strategy>] [--delete-branch]
```

**Examples**:
```
/fractary-repo-pr create "Add user export feature" --body "Implements CSV export..." --work-id 123
/fractary-repo-pr comment 456 "LGTM! Tests passing."
/fractary-repo-pr review 456 approve --comment "Great work!"
/fractary-repo-pr merge 456 --strategy squash --delete-branch
```

**Workflow**:
1. Parse subcommand and arguments
2. Validate inputs
3. Invoke `repo-manager` agent with operation
4. Display PR URL or result

---

### Command: /fractary-repo-tag

**Purpose**: Create and push semantic version tags

**Syntax**:
```
/fractary-repo-tag create <tag_name> [--message <message>] [--sign]
/fractary-repo-tag push <tag_name|all>
/fractary-repo-tag list
```

**Examples**:
```
/fractary-repo-tag create v1.2.3 --message "Release version 1.2.3"
/fractary-repo-tag create v1.3.0 --sign
/fractary-repo-tag push v1.2.3
/fractary-repo-tag push all
```

**Workflow**:
1. Parse subcommand and arguments
2. Validate tag format (semantic versioning)
3. Invoke `repo-manager` agent
4. Display tag info

---

### Command: /fractary-repo-cleanup

**Purpose**: List and delete stale branches

**Syntax**:
```
/fractary-repo-cleanup [--dry-run] [--before <date>] [--merged-only]
```

**Examples**:
```
/fractary-repo-cleanup --dry-run
/fractary-repo-cleanup --before 2024-09-01 --merged-only
/fractary-repo-cleanup
```

**Workflow**:
1. Parse arguments
2. List stale branches
3. If not dry-run: Confirm with user
4. Delete branches (excluding protected)
5. Display results

---

## Agent Specification

### Agent: repo-manager (Refactored)

**Purpose**: Universal source control agent that provides decision logic and routing for all repo operations

**Responsibilities**:
- Parse operation requests
- Validate inputs
- Determine which skill to invoke
- Route to appropriate skill
- Handle skill responses
- Return structured responses

**NOT Responsible For**:
- Executing scripts (that's handlers)
- Workflow logic (that's skills)
- Platform-specific knowledge (that's handlers)
- Bash code (that's scripts)

**XML Structure**:

```markdown
<CONTEXT>
Universal source control agent for GitHub, GitLab, Bitbucket.
Routes operations to appropriate skills.
</CONTEXT>

<CRITICAL_RULES>
- NEVER execute scripts directly
- NEVER contain platform-specific logic
- ALWAYS validate inputs before routing
- ALWAYS use skills for all work
- ALWAYS return structured responses
</CRITICAL_RULES>

<INPUTS>
Operation requests from:
- FABER plugins (programmatic)
- User commands (interactive)
- Other plugins

Format:
{
  "operation": "operation_name",
  "parameters": {...},
  "context": {...}
}
</INPUTS>

<WORKFLOW>
1. Parse operation request
2. Validate operation is supported
3. Validate required parameters present
4. Determine which skill to invoke:
   - generate-branch-name → branch-namer
   - create-branch → branch-manager
   - create-commit → commit-creator
   - push-branch → branch-pusher
   - create-pr|comment-pr|review-pr|merge-pr → pr-manager
   - create-tag|push-tag → tag-manager
   - list-stale-branches|delete-branch → cleanup-manager
5. Invoke skill with parameters
6. Handle skill response
7. Return to caller
</WORKFLOW>

<ROUTING_TABLE>
| Operation | Skill |
|-----------|-------|
| generate-branch-name | branch-namer |
| create-branch | branch-manager |
| delete-branch | cleanup-manager |
| create-commit | commit-creator |
| push-branch | branch-pusher |
| create-pr | pr-manager |
| comment-pr | pr-manager |
| review-pr | pr-manager |
| merge-pr | pr-manager |
| create-tag | tag-manager |
| push-tag | tag-manager |
| list-stale-branches | cleanup-manager |
</ROUTING_TABLE>

<OUTPUTS>
Structured JSON response:
{
  "status": "success|failure",
  "operation": "operation_name",
  "result": {...},
  "error": "error_message"
}
</OUTPUTS>

<ERROR_HANDLING>
- Unknown operation → "Operation not supported"
- Missing parameters → "Required parameter missing: {param}"
- Skill error → Pass through skill error response
- Configuration error → "Configuration invalid: {details}"
</ERROR_HANDLING>
```

**Key Changes from Current**:
- Remove ALL bash code examples (currently lines 55-293)
- Add XML markup structure
- Focus purely on routing logic
- No workflow implementation (that's in skills)
- Minimal context footprint (~150 lines vs 370 lines)

---

## Testing Strategy

### Unit Testing (Scripts)

Each script should be testable independently:

```bash
# Test script with valid inputs
./scripts/create-branch.sh "feat/123-test" "main"
echo $?  # Should be 0

# Test error handling
./scripts/create-branch.sh "feat/123-test" "nonexistent"
echo $?  # Should be 1

# Test protected branch check
./scripts/delete-branch.sh "main" "both" "false"
echo $?  # Should be 3 (protected branch error)
```

### Integration Testing (Skills)

Test skills invoke handlers correctly:

1. Configure test handler
2. Invoke skill with test parameters
3. Verify skill calls handler with correct arguments
4. Verify skill processes handler response correctly
5. Verify structured output format

### End-to-End Testing (Commands)

Test full command → agent → skill → handler flow:

```bash
# Test branch creation workflow
/fractary-repo-branch create 123 "test feature"
# Verify: branch created, proper name format

# Test commit workflow
/fractary-repo-commit "Add test" --type feat --work-id 123
# Verify: commit created, proper format, metadata included

# Test PR workflow
/fractary-repo-pr create "Test PR" --work-id 123
# Verify: PR created, work item linked, FABER metadata included
```

### Platform Testing

Test each handler independently:

**GitHub** (complete implementation):
- Test all 13 operations
- Verify error handling
- Test protected branch safety
- Verify metadata formatting

**GitLab** (stub implementation):
- Verify returns "not implemented" error
- Verify error format is correct
- Document for contributors

**Bitbucket** (stub implementation):
- Same as GitLab

### FABER Integration Testing

Test integration with FABER workflow:

1. Run FABER workflow with repo plugin
2. Verify branch creation in Frame phase
3. Verify commits in Architect/Build phases
4. Verify PR creation in Release phase
5. Verify metadata propagation throughout

---

## Success Criteria

### Phase 1: Handler Infrastructure ✅ COMPLETE

- [x] Handler directories created for all 3 platforms
- [x] GitHub handler SKILL.md complete with all 13 operations documented
- [x] GitLab handler stub with contribution guidelines
- [x] Bitbucket handler stub with contribution guidelines
- [x] GitHub scripts moved to handler directory
- [x] repo-common SKILL.md created with utilities specification

### Phase 2: Fine-Grained Skills

- [ ] 7 skill SKILL.md files created with XML markup
- [ ] Each skill has clear start/end message templates
- [ ] Each skill invokes appropriate handler
- [ ] Each skill returns structured JSON responses
- [ ] Skills tested independently

### Phase 3: Refactor Agent

- [ ] All bash code removed from agent
- [ ] XML markup added
- [ ] Agent file reduced to ~150 lines
- [ ] Routing table implemented
- [ ] Agent tested with all operations

### Phase 4: User Commands

- [ ] 6 command files created
- [ ] Commands parse arguments correctly
- [ ] Commands invoke agent properly
- [ ] Commands display results to user
- [ ] Commands handle errors gracefully

### Phase 5: Configuration

- [ ] config/repo.example.json created
- [ ] Configuration schema documented
- [ ] repo-common loads configuration correctly
- [ ] Configuration validated on load

### Phase 6: New Operations

- [ ] 7 new scripts implemented for GitHub
- [ ] Scripts follow existing patterns
- [ ] Scripts have proper error handling
- [ ] Scripts return structured output
- [ ] Scripts tested independently

### Phase 7: Documentation

- [ ] README.md updated with new architecture
- [ ] Setup guides created for all 3 platforms
- [ ] Migration guide created
- [ ] Old monolithic skill deleted

### Overall Success

- [ ] Context usage reduced by 55-60%
- [ ] All existing operations work correctly
- [ ] All new operations work correctly
- [ ] FABER integration maintains compatibility
- [ ] Platform switching works via configuration
- [ ] Error handling is comprehensive
- [ ] Documentation is complete
- [ ] Code follows FRACTARY standards

---

## Implementation Checklist

### Phase 1: Handler Infrastructure ✅ COMPLETE

- [x] Create handler directories
- [x] Create GitHub handler SKILL.md
- [x] Create GitLab handler stub
- [x] Create Bitbucket handler stub
- [x] Move GitHub scripts
- [x] Create repo-common SKILL.md
- [x] Create this specification document

### Phase 2: Fine-Grained Skills

- [ ] Create branch-namer/SKILL.md
- [ ] Create branch-manager/SKILL.md
- [ ] Create commit-creator/SKILL.md
- [ ] Create branch-pusher/SKILL.md
- [ ] Create pr-manager/SKILL.md
- [ ] Create tag-manager/SKILL.md
- [ ] Create cleanup-manager/SKILL.md

### Phase 3: Refactor Agent

- [ ] Remove bash code from agents/repo-manager.md
- [ ] Add XML markup structure
- [ ] Add routing table
- [ ] Reduce to decision logic only
- [ ] Test agent routing

### Phase 4: User Commands

- [ ] Create commands/branch.md
- [ ] Create commands/commit.md
- [ ] Create commands/push.md
- [ ] Create commands/pr.md
- [ ] Create commands/tag.md
- [ ] Create commands/cleanup.md

### Phase 5: Configuration

- [ ] Create config/repo.example.json
- [ ] Implement config-loader.sh
- [ ] Test configuration loading
- [ ] Document configuration options

### Phase 6: New Operations (GitHub)

- [ ] Implement create-tag.sh
- [ ] Implement push-tag.sh
- [ ] Implement comment-pr.sh
- [ ] Implement review-pr.sh
- [ ] Implement delete-branch.sh
- [ ] Implement list-stale-branches.sh

### Phase 7: Documentation

- [ ] Update README.md
- [ ] Create docs/setup/github-setup.md
- [ ] Create docs/setup/gitlab-setup.md
- [ ] Create docs/setup/bitbucket-setup.md
- [ ] Create docs/migration.md
- [ ] Delete skills/repo-manager/ (after confirming migration)

### Testing

- [ ] Unit test all new scripts
- [ ] Integration test skills
- [ ] End-to-end test commands
- [ ] Test FABER integration
- [ ] Test platform switching (GitHub only, verify stubs)

---

## Appendix

### References

- **FRACTARY Plugin Standards**: `docs/standards/FRACTARY-PLUGIN-STANDARDS.md`
- **FABER Architecture**: `specs/SPEC-00002-faber-architecture.md`
- **Handler Pattern Reference**: `plugins/faber-cloud/` (reference implementation)
- **3-Layer Architecture**: `docs/conversations/2025-10-22-cli-tool-reorganization-faber-details.md`

### Version History

- **v2.0.0-spec** (2025-10-29): Initial specification created
- **Phase 1 Complete** (2025-10-29): Handler infrastructure implemented

### Contributors

- Claude Code (Architecture & Implementation)
- User (Requirements & Direction)

---

**End of Specification**
