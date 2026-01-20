# Test Log Standards

## Required Conventions

### 1. Identification
- ALWAYS include unique test_id
- ALWAYS specify test type (unit, integration, e2e, performance)
- ALWAYS include test framework name

### 2. Results Tracking
- ALWAYS include pass/fail/skip counts
- ALWAYS set status based on results (passed if all pass, failed if any fail)
- ALWAYS include coverage percentage when available

### 3. Failure Documentation
- ALWAYS include error messages for failures
- ALWAYS include stack traces when available
- ALWAYS include test name that failed

### 4. Output Capture
- ALWAYS capture test runner output
- ALWAYS preserve output formatting
- ALWAYS truncate excessively long output with marker

## Best Practices

- Use unique test_id format: `TEST-{timestamp}-{random}`
- Link test runs to CI/CD pipelines
- Include environment information (Node version, etc.)
- Track test flakiness over time
- Keep failed test logs longer than passing
- Archive test logs based on test type (e2e longer than unit)
- Include screenshots for e2e test failures
- Document known flaky tests
