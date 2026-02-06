# Bug Fix Specification Standards

## Required Conventions

### 1. Bug Description
- ALWAYS describe the bug clearly and its user-facing impact
- Include severity/priority context if known
- Reference the original bug report or issue number

### 2. Steps to Reproduce
- ALWAYS provide numbered steps that reliably reproduce the bug
- ALWAYS include "Expected" and "Actual" behavior
- Include environment details if relevant (OS, browser, version)

### 3. Proposed Solution
- ALWAYS describe the fix approach before implementing
- Explain why this approach was chosen over alternatives
- Identify any trade-offs or limitations of the fix

### 4. Affected Areas
- ALWAYS list all components, files, or systems affected by the bug
- Include both directly affected and potentially impacted areas
- This helps identify regression testing scope

### 5. Testing
- ALWAYS include regression tests that verify the fix
- ALWAYS include edge case tests for related scenarios
- Tests should prevent the same bug from recurring

## Optional Section Guidelines

### Root Cause Analysis
- Include when the root cause is non-obvious
- Document the investigation process for future reference
- Identify systemic issues that may need broader fixes

### Regression Risk
- Include for fixes that touch critical code paths
- Document which existing functionality might be affected
- Specify additional testing needed beyond standard regression

## Best Practices

- Start with reproduction before proposing a fix
- Keep the spec focused on the specific bug — broader improvements belong in a separate spec
- Update root cause analysis as understanding evolves during investigation
