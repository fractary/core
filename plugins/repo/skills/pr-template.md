---
name: fractary-pr-template
description: Standard pull request template with required sections for Fractary projects
---

# Fractary Pull Request Template

All pull requests in Fractary projects should follow this structure.

## Required Sections

### Summary

**One-line description of the change:**
- Clear and concise
- Explains WHAT changed
- Imperative mood preferred

**Example:**
```
Add semantic branch creation with work item integration
```

### Changes

**Bullet list of key changes:**
- Focus on significant modifications
- Group related changes
- Highlight breaking changes
- Note new dependencies

**Example:**
```
- Implemented semantic branch naming algorithm
- Added work item integration for branch descriptions
- Created branch-name-generate MCP tool
- Updated branch-create agent workflow
- **Breaking:** Removed legacy branch creation syntax
```

### Testing

**How the changes were tested:**
- Unit tests added/updated
- Integration tests run
- Manual testing performed
- Edge cases verified

**Example:**
```
- Added unit tests for branch name generation (95% coverage)
- Integration tests verify work item fetching
- Manual testing: created 10+ branches with various inputs
- Tested edge cases: special characters, long names, missing work items
```

### Related

**Work item references and related PRs:**
- Link to issues/tickets
- Reference related PRs
- Note dependencies

**Example:**
```
- Closes #123
- Related to #456
- Depends on #789
```

## Optional Sections

### Breaking Changes

If present, highlight prominently:

```
## Breaking Changes

- Removed `branch-create <name>` syntax
- Use `branch-create --work-id <id>` or `branch-create "<description>"` instead
- Migration guide: [link]
```

### Security

For security-related changes:

```
## Security

- Addresses CVE-2024-XXXXX
- No known vulnerabilities introduced
- Security review completed
```

### Performance

For performance improvements:

```
## Performance

- Reduces branch creation time from 8s to 2s
- 75% reduction in LLM invocations
- 85% reduction in token usage
```

### Documentation

Link to related documentation:

```
## Documentation

- Updated: docs/guides/branch-creation.md
- Added: specs/SPEC-00027-semantic-branching.md
- Architecture diagram: docs/diagrams/branch-workflow.svg
```

## Full Example Template

```markdown
# Add semantic branch creation with work item integration

## Summary

Implements intelligent branch naming that generates semantic names from work items, descriptions, or direct names with flexible prefix support.

## Changes

- Implemented semantic branch naming algorithm
- Added work item integration for automatic title fetching
- Created `fractary_repo_branch_name_generate` MCP tool
- Updated branch-create agent with three naming modes
- Added worktree creation option
- **Breaking:** Removed positional branch name argument

## Testing

- Unit tests: branch name generation (95% coverage)
- Integration tests: work item fetching, git operations
- Manual testing: 15+ branches created with various inputs
- Edge cases: special characters, long titles, missing work items, invalid prefixes
- All tests passing in CI

## Related

- Closes #123
- Related to #456 (work item integration)
- Follows architecture from SPEC-00027

## Breaking Changes

Old syntax no longer supported:
```bash
/repo:branch-create my-branch-name  # ❌ No longer works
```

Use new syntax:
```bash
/repo:branch-create "add CSV export"  # ✅ Description mode
/repo:branch-create --work-id 123     # ✅ Work item mode
/repo:branch-create feature/my-branch # ✅ Direct mode
```

## Performance

- Branch creation: 8-15s → 1-2s (5-7x faster)
- LLM invocations: 3-4 → 1 (75% reduction)
- Token usage: ~3000 → ~500 (85% reduction)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

## Quick Reference

**Minimal PR (simple fix):**
```markdown
# Fix branch name sanitization for special characters

## Summary
Properly escape special characters in branch names.

## Changes
- Add sanitization function for branch names
- Handle spaces, slashes, and Unicode characters

## Testing
- Unit tests added
- Manual testing with 10+ special character cases

## Related
- Fixes #456
```

**Standard PR:**
```markdown
# Add OAuth integration

## Summary
Integrate OAuth authentication for Google and GitHub.

## Changes
- OAuth flow implementation
- Token management
- User model updates
- Frontend login buttons

## Testing
- Integration tests for OAuth flow
- Manual testing with Google and GitHub
- Security review completed

## Related
- Closes #789
- Architecture: SPEC-00028
```
