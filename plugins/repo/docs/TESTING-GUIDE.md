# SPEC-00030 Testing Guide

## Overview

This guide provides step-by-step manual testing procedures for the fractary-repo enhancements implemented in version 2.5.0 per SPEC-00030.

## Prerequisites

- Git repository with remote configured
- Node.js and npm/pnpm installed
- Access to Claude Code CLI

## Test Environment Setup

```bash
# Navigate to test repository
cd /path/to/test/repo

# Ensure git remote is configured
git remote -v

# Create test configuration directory
mkdir -p .fractary/core

# Optional: Create custom config for testing
cat > .fractary/core/config.yaml <<EOF
version: "2.0"
repo:
  worktree:
    default_location: ~/.claude-worktrees/
    path_pattern: "{organization}-{project}-{work-id}"
EOF
```

## Unit Tests

### Run SDK Tests

```bash
cd sdk/js
pnpm test

# Run specific test files
pnpm test organization.test.ts
pnpm test path-generator.test.ts
pnpm test config.test.ts
```

### Expected Results

All tests should pass:
- ✓ organization.test.ts: ~50 tests
- ✓ path-generator.test.ts: ~25 tests
- ✓ config.test.ts: ~20 tests

## Manual Testing Checklist

### Phase 1: Organization Extraction

#### Test 1.1: SSH Remote URL

```bash
# Set up SSH remote
git remote set-url origin git@github.com:fractary/core.git

# Test organization extraction via plugin
# This will be tested indirectly through worktree commands
```

**Expected**:
- Organization: `fractary`
- Project: `core`

#### Test 1.2: HTTPS Remote URL

```bash
# Set up HTTPS remote
git remote set-url origin https://github.com/fractary/core.git

# Test via worktree-create with JSON output
/fractary-repo:worktree-create --work-id 999 --branch test/org-extraction --format json
```

**Expected JSON**:
```json
{
  "success": true,
  "organization": "fractary",
  "project": "core",
  "work_id": "999"
}
```

**Cleanup**:
```bash
/fractary-repo:worktree-remove ~/.claude-worktrees/fractary-core-999 --force
git branch -D test/org-extraction
```

#### Test 1.3: GitLab Subgroups

```bash
# Set up GitLab remote with subgroups
git remote set-url origin git@gitlab.com:org/team/project.git

# Test organization extraction
/fractary-repo:worktree-create --work-id 888 --branch test/gitlab --format json
```

**Expected**:
- Organization: `org-team` (joined with hyphen)
- Project: `project`

**Cleanup**:
```bash
/fractary-repo:worktree-remove ~/.claude-worktrees/org-team-project-888 --force
git branch -D test/gitlab
git remote set-url origin git@github.com:fractary/core.git  # Restore
```

#### Test 1.4: No Remote (Local)

```bash
# Create temporary repo without remote
cd /tmp
git init test-local-repo
cd test-local-repo
git commit --allow-empty -m "Initial commit"

# Test via worktree commands
/fractary-repo:worktree-create --work-id 777 --branch test/local --format json
```

**Expected**:
- Organization: `local`
- Project: `test-local-repo` (directory basename)

**Cleanup**:
```bash
cd /tmp
rm -rf test-local-repo
```

### Phase 2: Branch Create Command

#### Test 2.1: Basic Branch Creation

```bash
# Create branch from current HEAD
/fractary-repo:branch-create feature/test-258
```

**Expected Output**:
```
✓ Branch created: feature/test-258
  Based on: main
  Commit: abc123d
```

**Verify**:
```bash
git branch --list feature/test-258
# Should show the branch exists
```

**Cleanup**:
```bash
git branch -D feature/test-258
```

#### Test 2.2: Branch Create with Custom Base

```bash
# Create develop branch first
git branch develop

# Create branch from develop
/fractary-repo:branch-create feature/test-259 --from develop
```

**Expected Output**:
```
✓ Branch created: feature/test-259
  Based on: develop
  Commit: abc123d
```

**Cleanup**:
```bash
git branch -D feature/test-259 develop
```

#### Test 2.3: Branch Create with JSON Output

```bash
/fractary-repo:branch-create feature/test-260 --format json
```

**Expected JSON**:
```json
{
  "success": true,
  "branch": "feature/test-260",
  "base_branch": "main",
  "commit": "abc123def456789...",
  "short_commit": "abc123d"
}
```

**Verify**:
```bash
echo $?  # Should be 0 (success)
```

**Cleanup**:
```bash
git branch -D feature/test-260
```

#### Test 2.4: Error Handling - Branch Already Exists

```bash
# Create branch
git branch test-exists

# Try to create again
/fractary-repo:branch-create test-exists
```

**Expected Output**:
```
Error: Branch 'test-exists' already exists
```

**Expected Exit Code**: 3

**Cleanup**:
```bash
git branch -D test-exists
```

#### Test 2.5: Error Handling - Invalid Branch Name

```bash
/fractary-repo:branch-create "invalid branch name"
```

**Expected Output**:
```
Error: Invalid branch name (contains invalid characters)
```

**Expected Exit Code**: 2

#### Test 2.6: Error Handling - Base Branch Not Found

```bash
/fractary-repo:branch-create feature/test --from nonexistent-branch
```

**Expected Output**:
```
Error: Base branch 'nonexistent-branch' not found
```

**Expected Exit Code**: 4

### Phase 3: Worktree Create with SPEC-00030

#### Test 3.1: New Worktree with SPEC-00030 Path

```bash
# Ensure no legacy worktree exists
rm -rf ../core-258

# Create worktree
/fractary-repo:worktree-create --work-id 258 --branch feature/258
```

**Expected Output**:
```
✓ Worktree created: /home/user/.claude-worktrees/fractary-core-258
✓ Branch: feature/258
✓ Based on: main
```

**Verify**:
```bash
ls -la ~/.claude-worktrees/fractary-core-258
git worktree list | grep fractary-core-258
```

**Cleanup**:
```bash
/fractary-repo:worktree-remove ~/.claude-worktrees/fractary-core-258 --force
git branch -D feature/258
```

#### Test 3.2: Worktree Create with JSON Output

```bash
/fractary-repo:worktree-create --work-id 259 --branch feature/259 --format json
```

**Expected JSON**:
```json
{
  "success": true,
  "path": "/home/user/.claude-worktrees/fractary-core-259",
  "absolute_path": "/home/user/.claude-worktrees/fractary-core-259",
  "branch": "feature/259",
  "base_branch": "main",
  "organization": "fractary",
  "project": "core",
  "work_id": "259"
}
```

**Cleanup**:
```bash
/fractary-repo:worktree-remove ~/.claude-worktrees/fractary-core-259 --force
git branch -D feature/259
```

#### Test 3.3: Legacy Worktree Detection

```bash
# Create legacy worktree manually
git worktree add ../core-legacy test-legacy-branch

# Try to create new worktree with same work ID
# (Assuming work ID extraction from path works)
/fractary-repo:worktree-create --work-id legacy --branch feature/legacy
```

**Expected Output**:
```
⚠️  Warning: Found existing legacy worktree at: ../core-legacy
   Consider running /fractary-repo:worktree-migrate

✓ Worktree created: ../core-legacy
✓ Branch: feature/legacy
✓ Based on: main
```

**Cleanup**:
```bash
git worktree remove ../core-legacy --force
git branch -D test-legacy-branch feature/legacy
```

### Phase 4: Worktree List with Organization

#### Test 4.1: List Worktrees - Table Format

```bash
# Create a test worktree
/fractary-repo:worktree-create --work-id 301 --branch feature/301

# List worktrees
/fractary-repo:worktree-list
```

**Expected Output**:
```
Active Worktrees:
  📁 /path/to/main (main)
     Branch: main
     Status: ✓ Main worktree
     Last activity: X hours ago

  📁 /home/user/.claude-worktrees/fractary-core-301
     Branch: feature/301
     Status: ✓ Clean
     Last activity: less than a minute ago

Total: 2 worktrees (1 main + 1 feature)
```

**Cleanup**:
```bash
/fractary-repo:worktree-remove ~/.claude-worktrees/fractary-core-301 --force
git branch -D feature/301
```

#### Test 4.2: List Worktrees - JSON Format

```bash
# Create test worktree
/fractary-repo:worktree-create --work-id 302 --branch feature/302

# List with JSON output
/fractary-repo:worktree-list --format json
```

**Expected JSON Structure**:
```json
{
  "worktrees": [
    {
      "path": "/path/to/main",
      "is_main": true,
      "branch": "main",
      "organization": "fractary",
      "project": "core",
      "work_id": ""
    },
    {
      "path": "/home/user/.claude-worktrees/fractary-core-302",
      "is_main": false,
      "branch": "feature/302",
      "organization": "fractary",
      "project": "core",
      "work_id": "302"
    }
  ],
  "summary": {
    "total": 2,
    "main": 1,
    "feature": 1
  }
}
```

**Cleanup**:
```bash
/fractary-repo:worktree-remove ~/.claude-worktrees/fractary-core-302 --force
git branch -D feature/302
```

#### Test 4.3: List Worktrees - Simple Format

```bash
/fractary-repo:worktree-list --format simple
```

**Expected Output** (one path per line):
```
/path/to/main
/home/user/.claude-worktrees/fractary-core-XXX
```

### Phase 5: Configuration System

#### Test 5.1: Custom Default Location

```bash
# Create custom config
cat > .fractary/core/config.yaml <<EOF
version: "2.0"
repo:
  worktree:
    default_location: ~/custom-worktrees/
    path_pattern: "{organization}-{project}-{work-id}"
EOF

# Create worktree
/fractary-repo:worktree-create --work-id 601 --branch feature/601
```

**Expected Output**:
```
✓ Worktree created: /home/user/custom-worktrees/fractary-core-601
```

**Verify**:
```bash
ls -la ~/custom-worktrees/fractary-core-601
```

**Cleanup**:
```bash
/fractary-repo:worktree-remove ~/custom-worktrees/fractary-core-601 --force
git branch -D feature/601
rm -rf ~/custom-worktrees
```

#### Test 5.2: Custom Path Pattern

```bash
# Create custom config with simplified pattern
cat > .fractary/core/config.yaml <<EOF
version: "2.0"
repo:
  worktree:
    default_location: ~/.worktrees/
    path_pattern: "{project}/{work-id}"
EOF

# Create worktree
/fractary-repo:worktree-create --work-id 602 --branch feature/602
```

**Expected Output**:
```
✓ Worktree created: /home/user/.worktrees/core/602
```

**Verify**:
```bash
ls -la ~/.worktrees/core/602
```

**Cleanup**:
```bash
/fractary-repo:worktree-remove ~/.worktrees/core/602 --force
git branch -D feature/602
rm -rf ~/.worktrees

# Restore default config
rm .fractary/core/config.yaml
```

## Test Results Summary

After completing all tests, verify:

- [ ] All unit tests pass
- [ ] Organization extraction works for SSH, HTTPS, GitLab subgroups
- [ ] Branch create command works with all options
- [ ] Branch create handles all error cases correctly
- [ ] New worktrees use SPEC-00030 path pattern
- [ ] Legacy worktree detection works
- [ ] Worktree list shows organization and project
- [ ] JSON output format is correct for all commands
- [ ] Migration dry-run works without making changes
- [ ] Interactive migration prompts correctly
- [ ] Automatic migration migrates all worktrees
- [ ] Custom configuration is respected
- [ ] No breaking changes to existing functionality

## Known Issues / Limitations

- Migration command requires manual cleanup of empty parent directories
- Organization extraction fails for file:// URLs (returns "local")
- Work ID extraction from path may fail for custom patterns

## Next Steps

1. Run full test suite: `pnpm test`
2. Perform regression testing on existing worktree commands
3. Test CLI integration if implemented
4. Update version to 2.5.0
5. Update CHANGELOG.md with all changes
