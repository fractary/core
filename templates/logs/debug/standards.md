# Debug Log Standards

## Required Conventions

### 1. Problem Documentation
- ALWAYS describe the problem clearly and completely
- ALWAYS include error messages and stack traces
- ALWAYS note the environment where the issue occurs

### 2. Investigation Tracking
- ALWAYS timestamp investigation steps
- ALWAYS document what was tried (even if unsuccessful)
- ALWAYS note hypotheses and their outcomes

### 3. Status Management
- ALWAYS update status as debugging progresses
- ALWAYS mark as resolved when root cause found and fixed
- ALWAYS link to related issues/PRs

### 4. Knowledge Capture
- ALWAYS document the root cause when identified
- ALWAYS include resolution steps for future reference
- ALWAYS note if issue might recur

## Best Practices

- Use unique debug_id format: `DEBUG-{timestamp}-{random}`
- Include reproduction steps when possible
- Attach relevant log snippets and screenshots
- Link to related debugging sessions
- Set severity based on impact (critical for production issues)
- Archive resolved sessions after 14 days
- Cross-reference with similar issues in the codebase
