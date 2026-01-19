# {{title}}

## Overview

{{overview}}

## Test Scope

### In Scope

{{#in_scope}}
- {{.}}
{{/in_scope}}

### Out of Scope

{{#out_of_scope}}
- {{.}}
{{/out_of_scope}}

## Test Environment

{{environment}}

## Test Cases

{{#test_cases}}
### {{id}}: {{title}}

**Priority:** {{priority}}
**Type:** {{type}}

**Preconditions:**
{{#preconditions}}
- {{.}}
{{/preconditions}}

**Steps:**
{{#steps}}
1. {{.}}
{{/steps}}

**Expected Result:**
{{expected_result}}

**Status:** {{status}}

{{/test_cases}}

## Test Data

{{test_data}}

## Results Summary

| Metric | Value |
|--------|-------|
| Total Tests | {{results.total}} |
| Passed | {{results.passed}} |
| Failed | {{results.failed}} |
| Skipped | {{results.skipped}} |
| Pass Rate | {{results.pass_rate}} |

## Issues Found

{{#issues}}
### {{id}}: {{title}}

**Severity:** {{severity}}
**Status:** {{status}}

{{description}}
{{/issues}}

## Recommendations

{{#recommendations}}
- {{.}}
{{/recommendations}}

## Sign-off

| Role | Name | Date | Status |
|------|------|------|--------|
{{#signoffs}}
| {{role}} | {{name}} | {{date}} | {{status}} |
{{/signoffs}}
