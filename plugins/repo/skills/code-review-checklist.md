---
name: fractary-code-review-checklist
description: Comprehensive code review checklist for Fractary projects covering architecture, security, performance, and quality
---

# Fractary Code Review Checklist

Use this checklist when reviewing pull requests to ensure code quality, security, and consistency.

## Architecture & Design

**Patterns & Structure:**
- [ ] Follows existing architectural patterns
- [ ] No circular dependencies introduced
- [ ] Proper separation of concerns (agents vs skills vs commands)
- [ ] DRY principle followed (no unnecessary duplication)
- [ ] Appropriate abstraction level (not over-engineered)

**FABER Workflow:**
- [ ] Changes align with appropriate FABER phase (Frame/Architect/Build/Evaluate/Release)
- [ ] Phase transitions properly documented
- [ ] Workflow steps clearly defined

**v3.0 Plugin Architecture:**
- [ ] Commands are ultra-lightweight (8-15 lines)
- [ ] Commands restricted with `allowed-tools: Task`
- [ ] Agents are self-sufficient and focused (60-100 lines)
- [ ] Agents use MCP tools (not CLI bash scripts)
- [ ] No manager agents or routing logic
- [ ] Skills used for expertise, not execution

## Code Quality

**Readability:**
- [ ] Clear, descriptive variable and function names
- [ ] Code is self-documenting (minimal comments needed)
- [ ] Comments explain WHY, not WHAT
- [ ] Complex logic has explanatory comments
- [ ] Consistent with project style

**Maintainability:**
- [ ] Functions are focused (single responsibility)
- [ ] No magic numbers (use constants)
- [ ] Error messages are clear and actionable
- [ ] Edge cases handled appropriately
- [ ] No dead code or commented-out code

**Documentation:**
- [ ] Agent workflow documented in `<WORKFLOW>` section
- [ ] Arguments table complete and accurate
- [ ] Examples provided where helpful
- [ ] Breaking changes clearly noted
- [ ] README updated if needed

## Security

**Input Validation:**
- [ ] All user input validated and sanitized
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevention (output encoding)
- [ ] Path traversal prevented (input validation)
- [ ] Command injection prevented (no shell=True with user input)

**Authentication & Authorization:**
- [ ] Proper authentication checks
- [ ] Authorization enforced (least privilege)
- [ ] Session management secure
- [ ] Token expiration appropriate (24h max)

**Secrets Management:**
- [ ] No hardcoded secrets or credentials
- [ ] Secrets loaded from environment or secure storage
- [ ] API keys not logged or exposed
- [ ] `.env` files in `.gitignore`
- [ ] No secrets in commit history

**Dependencies:**
- [ ] Dependencies from trusted sources
- [ ] No known vulnerabilities (check npm audit / pip-audit)
- [ ] Minimal dependency footprint
- [ ] Licenses compatible with project

## Performance

**Efficiency:**
- [ ] No N+1 query problems
- [ ] Appropriate use of caching
- [ ] Efficient algorithms (consider Big O)
- [ ] No unnecessary API calls
- [ ] Batch operations where appropriate

**Context Management:**
- [ ] Commands don't bloat main context
- [ ] Agents use isolated context appropriately
- [ ] Skills provide expertise without excessive tokens
- [ ] LLM invocations minimized

**Resource Usage:**
- [ ] File operations efficient (no redundant reads)
- [ ] Memory usage reasonable (no large arrays)
- [ ] Network calls optimized (connection pooling)

## Testing

**Coverage:**
- [ ] Unit tests for business logic
- [ ] Integration tests for workflows
- [ ] Edge cases tested
- [ ] Error cases tested
- [ ] Appropriate test coverage (aim for 80%+)

**Quality:**
- [ ] Tests are clear and focused
- [ ] Tests don't depend on each other
- [ ] Tests run quickly
- [ ] No flaky tests
- [ ] Mocks used appropriately

**CI/CD:**
- [ ] All tests pass in CI
- [ ] No warnings or errors in build
- [ ] Linting passes
- [ ] Type checking passes (if applicable)

## Git & Commits

**Commit Quality:**
- [ ] Follows conventional commit format (feat/fix/docs/refactor/etc.)
- [ ] Commit messages clear and descriptive
- [ ] Commits are atomic (one logical change per commit)
- [ ] No "fix typo" or "WIP" commits in final PR
- [ ] FABER metadata included where appropriate

**PR Quality:**
- [ ] Follows Fractary PR template
- [ ] Summary is clear and complete
- [ ] Changes section lists key modifications
- [ ] Testing section describes validation
- [ ] Related work items linked
- [ ] Breaking changes highlighted

**Branch Management:**
- [ ] Branch name follows convention (feat/fix/chore prefix)
- [ ] Branch up to date with base
- [ ] No merge conflicts
- [ ] Clean commit history (consider squashing)

## Fractary-Specific

**MCP Tools:**
- [ ] Uses MCP tools instead of bash CLI where possible
- [ ] Tool names follow convention: `fractary_{domain}_{operation}`
- [ ] Tools properly defined in MCP server
- [ ] Error handling for tool failures

**Agent Design:**
- [ ] Agent name uses namespace: `fractary-{domain}:{agent-name}`
- [ ] Description includes "MUST BE USED" for auto-invocation
- [ ] Tools list is complete and accurate
- [ ] Workflow section documents all steps
- [ ] Arguments table clear (conditional vs required)

**Command Design:**
- [ ] Command uses `allowed-tools: Task` restriction
- [ ] Command provides clear invocation instructions
- [ ] Command references expertise skills where appropriate
- [ ] Argument hints are accurate
- [ ] Model specified (usually claude-haiku-4-5)

## Review Actions

When reviewing, provide:

**Approve:**
- ✅ All critical items pass
- ✅ Minor suggestions as comments (non-blocking)
- ✅ Clear to merge

**Request Changes:**
- ❌ Critical issues found (security, bugs, architecture)
- ❌ Must be fixed before merge
- ❌ Clear explanation of required changes

**Comment:**
- 💬 Questions or suggestions
- 💬 Alternative approaches to consider
- 💬 Learning opportunities

## Quick Checklist

For quick reviews, focus on:

1. **Security**: No vulnerabilities introduced?
2. **Architecture**: Follows v3.0 patterns?
3. **Testing**: Tests added and passing?
4. **Breaking Changes**: Documented and justified?
5. **Documentation**: Clear and complete?

If all 5 pass, likely ready to approve!
