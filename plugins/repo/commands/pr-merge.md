---
allowed-tools: Bash(gh pr merge:*), Bash(gh pr view:*)
description: Merge pull requests
model: claude-haiku-4-5
argument-hint: '<pr_number> [--squash|--merge|--rebase] [--delete-branch] [--context "<text>"]'
---

## Context

- Repository: !`gh repo view --json nameWithOwner -q .nameWithOwner`
- Config defaults: !`cat .fractary/config.yaml 2>/dev/null | grep -A5 'pr:' | grep -A2 'merge:' | grep -E '(strategy|delete_branch):' | tr '\n' ' ' || echo "strategy: squash delete_branch: true"`

## Your task

Merge pull request using `gh pr merge`.

Parse arguments:
- pr_number (required)
- strategy: --squash, --merge, or --rebase
- --delete-branch flag

**Default behavior**: If no strategy flag (--squash, --merge, --rebase) is provided, use the configured default from `.fractary/config.yaml` at `repo.defaults.pr.merge.strategy`. If no --delete-branch flag is provided, check the configured default at `repo.defaults.pr.merge.delete_branch`.

The config defaults shown above indicate the configured values. If the config could not be read, the fallback defaults are: strategy=squash, delete_branch=true.

**Priority**: Explicit command-line flags always override config defaults.

Example: `gh pr merge 42 --squash --delete-branch`

## Execution steps

1. First, get the list of changed files in the PR:
   ```
   gh pr view <pr_number> --json files -q '.files[].path'
   ```

2. Execute the merge operation using `gh pr merge` with the appropriate flags.

3. After a successful merge, analyze the changed files and output a **Required Actions** section.

## Required Actions Analysis

After successful merge, analyze which directories were changed and output required follow-up actions:

### Packages requiring npm publish

| Directory Pattern | Package | Action |
|------------------|---------|--------|
| `sdk/js/**` | `@fractary/core` | `cd sdk/js && npm publish` |
| `cli/**` | `@fractary/core-cli` | `cd cli && npm publish` |
| `mcp/server/**` | `@fractary/core-mcp` | `cd mcp/server && npm publish` |

### Plugins requiring sync/update

| Directory Pattern | Plugin | Action |
|------------------|--------|--------|
| `plugins/core/**` | fractary-core | `/Fractary-Core-Configure` |
| `plugins/repo/**` | fractary-repo | Reinstall plugin or restart Claude Code |
| `plugins/work/**` | fractary-work | Reinstall plugin or restart Claude Code |
| `plugins/file/**` | fractary-file | Reinstall plugin or restart Claude Code |
| `plugins/logs/**` | fractary-logs | Reinstall plugin or restart Claude Code |
| `plugins/spec/**` | fractary-spec | Reinstall plugin or restart Claude Code |
| `plugins/docs/**` | fractary-docs | Reinstall plugin or restart Claude Code |
| `plugins/status/**` | fractary-status | `/Fractary-Status-Sync` |

## Output format

After successful merge, output the following:

```
✓ PR #<number> merged successfully

## Required Actions

<Only list sections that apply based on changed files>

### Packages to Republish
- [ ] `@fractary/core` - run `cd sdk/js && npm publish`
- [ ] `@fractary/core-cli` - run `cd cli && npm publish`
- [ ] `@fractary/core-mcp` - run `cd mcp/server && npm publish`

### Plugins to Update
- [ ] fractary-<name> - <action>
```

If no packages or plugins were changed, output:
```
✓ PR #<number> merged successfully

No packages or plugins require updates.
```
