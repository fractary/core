---
name: fractary-commit-format
description: Conventional commit format with FABER metadata standards for Fractary projects
---

# Fractary Commit Format

All commits in Fractary projects follow conventional commit format with FABER metadata.

## Format Structure

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Type (Required)

**Standard types:**
- `feat`: New feature or functionality
- `fix`: Bug fix
- `docs`: Documentation changes only
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code restructuring (no feature change or bug fix)
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, tooling
- `ci`: CI/CD pipeline changes

**Breaking changes:** Add `!` after type/scope: `feat(api)!: remove deprecated endpoints`

## Scope (Optional)

Component or area of change:
- `repo`: Repository operations
- `work`: Work tracking operations
- `spec`: Specification operations
- `logs`: Logging operations
- `docs`: Documentation operations
- `api`: API changes
- `cli`: CLI changes

## Subject (Required)

- Imperative mood: "add feature" not "added feature" or "adds feature"
- No period at end
- Lowercase first letter
- Max 72 characters
- Clear and concise

**Good examples:**
- `feat(repo): add branch creation with work item linking`
- `fix(work): handle missing issue numbers gracefully`
- `docs(spec): update v3.0 architecture guide`

**Bad examples:**
- `Added new feature` (past tense, no type)
- `Fix bug.` (vague, period at end)
- `Update` (no context)

## Body (Optional)

- Explain WHAT and WHY, not HOW
- Wrap at 72 characters
- Separate from subject with blank line
- Can include multiple paragraphs

## Footer (Optional but Encouraged)

**Work item references:**
```
Refs: #123
```

**Breaking changes:**
```
BREAKING CHANGE: Old API endpoints removed. Use v2 API instead.
```

**Multiple references:**
```
Refs: #123, #456
Closes: #789
```

## FABER Metadata

Include FABER phase context when applicable:

```
feat(spec): add FABER workflow templates

Add reusable FABER workflow templates for common operations.

FABER Phase: Build
Refs: #45

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

## Full Example

```
feat(repo): add semantic branch naming with work item integration

Implements intelligent branch naming that generates semantic names from:
- Work item titles (feat/123-add-oauth-support)
- Description strings (feat/add-csv-export)
- Direct branch names (feature/my-branch)

Integrates with work tracking to fetch issue details and generate
appropriate prefixes based on work item type.

BREAKING CHANGE: Old branch-create syntax no longer supported.
Use --work-id flag instead of positional argument.

Refs: #123
FABER Phase: Build

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

## Quick Reference

**Minimal commit:**
```
feat(repo): add branch deletion
```

**Standard commit:**
```
fix(work): handle missing issue numbers

Check for null issue numbers before accessing properties.

Refs: #456
```

**Full commit with breaking change:**
```
feat(api)!: remove deprecated v1 endpoints

All v1 API endpoints have been removed. Clients must migrate to v2 API.

BREAKING CHANGE: /api/v1/* endpoints no longer available.
Use /api/v2/* endpoints with updated request format.

Refs: #789
FABER Phase: Build

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```
