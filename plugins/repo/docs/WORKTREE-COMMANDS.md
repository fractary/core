# Fractary-Repo Worktree Commands

## Overview

Git worktrees allow you to work on multiple branches simultaneously without switching branches or stashing changes. The fractary-repo plugin provides four commands to manage worktrees safely and efficiently.

**What are worktrees?**
- A worktree is a separate working directory linked to the same git repository
- Each worktree can have a different branch checked out
- All worktrees share the same git history and objects
- Perfect for working on multiple features, bug fixes, or reviews concurrently

**Benefits:**
- No need to stash changes when switching contexts
- Faster than cloning the repository multiple times
- Shared git objects save disk space
- All worktrees stay in sync with the same repository

---

## Commands

### /fractary-repo:worktree-create

Create a new git worktree for isolated work.

#### Syntax
```bash
/fractary-repo:worktree-create --work-id <id> --branch <name> [options]
```

#### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--work-id <id>` | Yes | Work item identifier (e.g., issue number, plan ID) |
| `--branch <name>` | Yes | Branch name to create or checkout |
| `--path <path>` | No | Custom worktree path (default: auto-generated) |
| `--base <branch>` | No | Base branch to create from (default: main/master or current) |
| `--no-checkout` | No | Create worktree without checking out files (faster) |

#### Path Generation

If `--path` is not provided, the path is automatically generated:
```
../{project-name}-{work-id}
```

For example, in project `fractary-core` with `--work-id 258`:
```
../fractary-core-258
```

#### Branch Behavior

- **If branch exists remotely**: Checks out the existing remote branch
- **If branch exists locally**: Returns error (prevents conflicts)
- **If branch doesn't exist**: Creates new branch from base branch

#### Examples

**Basic usage** (auto-generated path):
```bash
/fractary-repo:worktree-create --work-id 258 --branch feature/258
```
Output:
```
Creating new branch 'feature/258' from 'main'...
✓ Worktree created: ../fractary-core-258
✓ Branch: feature/258
✓ Based on: main
✓ Current directory: /mnt/c/GitHub/fractary/fractary-core-258
```

**Custom path**:
```bash
/fractary-repo:worktree-create --work-id 259 --branch feature/259 --path ~/work/issue-259
```

**Specific base branch**:
```bash
/fractary-repo:worktree-create --work-id 260 --branch feature/260 --base develop
```

**No checkout** (faster for large repos):
```bash
/fractary-repo:worktree-create --work-id 261 --branch feature/261 --no-checkout
```

#### Error Cases

| Error | Cause | Solution |
|-------|-------|----------|
| Not in git repository | Command run outside git repo | Navigate to git repository |
| Path already exists | Worktree path conflicts | Remove existing worktree or use different path |
| Branch exists locally | Branch already used by another worktree | Use different branch name or remove existing worktree |
| Invalid branch name | Branch name has invalid characters | Use valid git branch name (no spaces, special chars) |
| Base branch not found | Specified base branch doesn't exist | Check branch name or use different base |

---

### /fractary-repo:worktree-list

List all git worktrees with metadata.

#### Syntax
```bash
/fractary-repo:worktree-list [--format <type>]
```

#### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--format <type>` | No | Output format: `table` (default), `json`, or `simple` |

#### Output Formats

**Table Format** (default) - Human-readable:
```bash
/fractary-repo:worktree-list
```
Output:
```
Active Worktrees:
  📁 /mnt/c/GitHub/fractary/core (main)
     Branch: main
     Status: ✓ Main worktree
     Last activity: 2 hours ago

  📁 /mnt/c/GitHub/fractary/core-258
     Branch: feature/258
     Status: ✓ Clean
     Last activity: 10 minutes ago

  📁 /mnt/c/GitHub/fractary/core-259
     Branch: feature/259
     Status: ⚠ Has uncommitted changes
     Last activity: 3 days ago
     Changes: 5 uncommitted files

Total: 3 worktrees (1 main + 2 feature)
```

**JSON Format** - Machine-readable:
```bash
/fractary-repo:worktree-list --format json
```
Output:
```json
{
  "worktrees": [
    {
      "path": "/mnt/c/GitHub/fractary/core",
      "is_main": true,
      "branch": "main",
      "head_commit": "abc123d",
      "uncommitted_changes": 0,
      "last_activity": "2026-01-06T14:30:00Z"
    },
    {
      "path": "/mnt/c/GitHub/fractary/core-258",
      "is_main": false,
      "branch": "feature/258",
      "head_commit": "def456a",
      "uncommitted_changes": 0,
      "last_activity": "2026-01-06T16:20:00Z"
    }
  ],
  "summary": {
    "total": 2,
    "main": 1,
    "feature": 1
  }
}
```

**Simple Format** - Paths only:
```bash
/fractary-repo:worktree-list --format simple
```
Output:
```
/mnt/c/GitHub/fractary/core
/mnt/c/GitHub/fractary/core-258
/mnt/c/GitHub/fractary/core-259
```

#### Metadata Collected

For each worktree:
- **Path**: Absolute path to worktree
- **Branch**: Current branch name
- **Status**: Main worktree, clean, or has uncommitted changes
- **Last activity**: Time since last commit
- **Uncommitted changes**: Count of modified/added/deleted files

---

### /fractary-repo:worktree-remove

Safely remove a git worktree.

#### Syntax
```bash
/fractary-repo:worktree-remove <path> [--force]
```

#### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<path>` | Yes | Path to worktree to remove (can be relative or absolute) |
| `--force` | No | Skip uncommitted changes check |

#### Safety Features

The command validates before removing:
1. ✅ Worktree exists and is not the main worktree
2. ✅ Not removing the current worktree (you must cd out first)
3. ✅ No uncommitted changes (unless `--force`)
4. ⚠️ Warns about unpushed commits and asks for confirmation

#### Examples

**Basic removal** (clean worktree):
```bash
cd /main-worktree
/fractary-repo:worktree-remove ../fractary-core-258
```
Output:
```
✓ Worktree removed: ../fractary-core-258
```

**With uncommitted changes** (blocks removal):
```bash
/fractary-repo:worktree-remove ../fractary-core-259
```
Output:
```
Error: Uncommitted changes in worktree. Commit or use --force

To see changes:
  cd ../fractary-core-259 && git status

To force removal:
  /fractary-repo:worktree-remove ../fractary-core-259 --force
```

**Force removal** (ignores uncommitted changes):
```bash
/fractary-repo:worktree-remove ../fractary-core-259 --force
```
Output:
```
✓ Worktree removed: ../fractary-core-259
```

**With unpushed commits** (warns and asks):
```bash
/fractary-repo:worktree-remove ../fractary-core-260
```
Output:
```
⚠️  Warning: Worktree has unpushed commits:
  e4f5g6h Implement feature X
  a1b2c3d Fix bug Y

[Interactive prompt: "This worktree has unpushed commits. Continue removing worktree?"]
> Yes, remove anyway

✓ Worktree removed: ../fractary-core-260
⚠️  Note: Unpushed commits were deleted
```

#### Error Cases

| Error | Cause | Solution |
|-------|-------|----------|
| Not a worktree | Path doesn't exist or isn't a worktree | Check path with `/fractary-repo:worktree-list` |
| Current worktree | Trying to remove current directory | Change to different directory first |
| Main worktree | Trying to remove main worktree | Cannot remove main worktree |
| Uncommitted changes | Worktree has uncommitted changes | Commit changes or use `--force` |

---

### /fractary-repo:worktree-prune

Clean up stale and orphaned worktrees.

#### Syntax
```bash
/fractary-repo:worktree-prune [options]
```

#### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--dry-run` | No | Show what would be removed without removing |
| `--auto` | No | Remove automatically without prompting (dangerous) |
| `--max-age <days>` | No | Consider worktrees older than N days as stale (default: 30) |

#### Detection Criteria

A worktree is considered **stale** or **orphaned** if:

1. **Branch deleted on remote** AND no uncommitted changes
   - The branch has been deleted from the remote repository
   - No local uncommitted work to preserve

2. **No activity for > max-age days**
   - No commits in the worktree for longer than the threshold
   - Default: 30 days

3. **Directory missing**
   - Worktree directory deleted but git still tracking it
   - Can be cleaned up safely

#### Modes

**Dry Run** (safe preview):
```bash
/fractary-repo:worktree-prune --dry-run
```
Output:
```
[DRY RUN] Would remove the following worktrees:

  📁 ../fractary-core-259
     Reason: branch_deleted
     Size: 150M

  📁 ../fractary-core-260
     Reason: no_activity_45_days
     Size: 148M

Total: 2 worktrees (~298 MB)

Run without --dry-run to actually remove these worktrees.
```

**Interactive** (default, prompts for each):
```bash
/fractary-repo:worktree-prune
```
Output:
```
Scanning for orphaned worktrees...

Found 2 stale worktrees:

Worktree: ../fractary-core-259
Branch: feature/259 (deleted on remote)
Reason: branch_deleted
Size: 150M

[Prompt: "Remove this worktree?"]
> Yes, remove

✓ Removed: ../fractary-core-259

Worktree: ../fractary-core-260
Branch: feature/260
Reason: no_activity_45_days
Last activity: 45 days ago
Size: 148M

[Prompt: "Remove this worktree?"]
> No, keep

Skipped: ../fractary-core-260

Summary:
  ✓ 1 worktree removed
  ✓ 1 worktree kept
  💾 Disk space freed: ~150 MB
```

**Auto** (removes without prompting):
```bash
/fractary-repo:worktree-prune --auto
```
Output:
```
Scanning for orphaned worktrees...

✓ Removed: ../fractary-core-259 (branch_deleted)
✓ Removed: ../fractary-core-260 (no_activity_45_days)

Summary:
  ✓ 2 worktrees removed
  💾 Disk space freed: ~298 MB
```

**Custom max age**:
```bash
/fractary-repo:worktree-prune --max-age 7
```
Removes worktrees with no activity for 7+ days.

#### Safety Notes

- Main worktree is never considered stale
- Dry run is recommended before actual cleanup
- Auto mode uses `--force` removal (can lose uncommitted work)
- Interactive mode is the safest option

---

## Common Workflows

### Create and Work in New Worktree

1. Create worktree for new feature:
```bash
/fractary-repo:worktree-create --work-id 258 --branch feature/258
```

2. Work in the worktree (automatically switched):
```bash
# Already in /path/to/project-258
git add .
git commit -m "Implement feature"
git push
```

3. Return to main worktree:
```bash
cd /path/to/main-project
```

### List and Remove Specific Worktree

1. List all worktrees:
```bash
/fractary-repo:worktree-list
```

2. Remove specific worktree:
```bash
/fractary-repo:worktree-remove ../project-258
```

### Clean Up All Stale Worktrees

1. Preview what would be removed:
```bash
/fractary-repo:worktree-prune --dry-run
```

2. Remove stale worktrees interactively:
```bash
/fractary-repo:worktree-prune
```

3. Or remove all automatically:
```bash
/fractary-repo:worktree-prune --auto
```

### Work on Multiple Features Simultaneously

1. Create worktree for feature A:
```bash
/fractary-repo:worktree-create --work-id 100 --branch feature/a
```

2. Create worktree for feature B:
```bash
cd /main-project  # Return to main first
/fractary-repo:worktree-create --work-id 101 --branch feature/b
```

3. Switch between them:
```bash
cd ../project-100  # Work on feature A
cd ../project-101  # Work on feature B
```

4. Clean up when done:
```bash
cd /main-project
/fractary-repo:worktree-remove ../project-100
/fractary-repo:worktree-remove ../project-101
```

---

## Troubleshooting

### Error: Cannot remove current worktree

**Cause**: You're trying to remove the worktree you're currently in.

**Solution**: Change to a different directory first:
```bash
cd /path/to/main-worktree
/fractary-repo:worktree-remove /path/to/feature-worktree
```

### Error: Branch already exists locally

**Cause**: The branch name is already used by another worktree.

**Solution**:
- Use a different branch name, or
- Remove the existing worktree first:
```bash
/fractary-repo:worktree-list
/fractary-repo:worktree-remove <existing-worktree-path>
```

### Error: Path already exists

**Cause**: The auto-generated path conflicts with an existing directory.

**Solution**:
- Use a custom path: `--path /custom/path`
- Remove the existing directory/worktree

### Worktree has uncommitted changes

**Cause**: Worktree has uncommitted work.

**Solution**:
- Commit the changes:
  ```bash
  cd /path/to/worktree
  git add .
  git commit -m "Save work"
  ```
- Or force removal (loses changes):
  ```bash
  /fractary-repo:worktree-remove /path/to/worktree --force
  ```

### How to find all my worktrees

Use the list command:
```bash
/fractary-repo:worktree-list

# Or simple format for scripting
/fractary-repo:worktree-list --format simple
```

---

## Git Version Requirements

- **Minimum**: Git 2.5.0 (worktree support introduced)
- **Recommended**: Git 2.15.0+ (improved worktree features)

Check your git version:
```bash
git --version
```

If using an older version, update git:
- **Ubuntu/Debian**: `sudo apt-get update && sudo apt-get install git`
- **macOS**: `brew upgrade git`
- **Windows**: Download from [git-scm.com](https://git-scm.com/)

---

## Best Practices

### Naming Conventions

Use consistent branch naming:
```bash
feature/issue-number-description
bugfix/issue-number-description
hotfix/issue-number-description
```

### Regular Cleanup

Clean up stale worktrees regularly:
```bash
# Weekly cleanup
/fractary-repo:worktree-prune --dry-run  # Preview
/fractary-repo:worktree-prune            # Interactive cleanup
```

### Path Organization

Keep worktrees at the same level as main repository:
```
/projects/
  myproject/           (main worktree)
  myproject-258/       (feature worktree)
  myproject-259/       (feature worktree)
```

This makes:
- Easy to find all worktrees
- Relative paths work consistently
- Auto-generated paths are predictable

### Avoid Nesting

Don't create worktrees inside other worktrees:
```bash
# BAD
/project/features/feature-258/

# GOOD
/project/
/project-258/
```

---

## Advanced Usage

### JSON Output for Scripting

Extract worktree paths:
```bash
/fractary-repo:worktree-list --format json | jq -r '.worktrees[].path'
```

Count worktrees:
```bash
/fractary-repo:worktree-list --format json | jq '.summary.total'
```

Find worktrees with uncommitted changes:
```bash
/fractary-repo:worktree-list --format json | jq -r '.worktrees[] | select(.uncommitted_changes > 0) | .path'
```

### Batch Operations

Remove all non-main worktrees:
```bash
for worktree in $(/fractary-repo:worktree-list --format simple | tail -n +2); do
  /fractary-repo:worktree-remove "$worktree" --force
done
```

Note: Use with caution! This will lose uncommitted work.

---

## FAQ

**Q: How many worktrees can I have?**
A: No hard limit, but each worktree uses disk space. Typically 5-10 is manageable.

**Q: Do worktrees share the git history?**
A: Yes! All worktrees share the same .git directory and objects, saving space.

**Q: Can I have the same branch in multiple worktrees?**
A: No, git prevents checking out the same branch in multiple worktrees to avoid conflicts.

**Q: What happens to my worktree if I delete the main repository?**
A: Worktrees become invalid. Always remove worktrees before deleting the main repository.

**Q: Can I move a worktree to a different location?**
A: Yes, but you need to use `git worktree move` (not implemented in these commands yet). For now, remove and recreate.

**Q: Do I need to pull in each worktree separately?**
A: No! Fetch happens at the repository level. Just do `git fetch` in any worktree to update all branches.

---

## See Also

- [Git Worktree Documentation](https://git-scm.com/docs/git-worktree)
- [Fractary-Repo Plugin](/plugins/repo/)
- [Git Best Practices](/docs/git-best-practices.md)

---

**Version**: 1.0.0
**Last Updated**: 2026-01-06
