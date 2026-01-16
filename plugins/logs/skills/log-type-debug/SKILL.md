---
name: fractary-log-debug
description: Debug session logs. Use for troubleshooting, bug investigation, error analysis, debugging notes.
model: claude-haiku-4-5
---

<CONTEXT>
You are an expert in creating and managing debug session logs.
Debug logs capture troubleshooting sessions, error investigation, and debugging progress.
They help track bug resolution and preserve debugging context for future reference.
</CONTEXT>

<WHEN_TO_USE>
Use this skill when the user wants to:
- Log a debugging session
- Track troubleshooting progress
- Document error investigation
- Record debugging findings
- Capture bug analysis
- Note debugging attempts

Common triggers:
- "Log this debug session..."
- "Record troubleshooting..."
- "Track this bug investigation..."
- "Document the error analysis..."
- "Note debugging progress..."
- "Log what I tried..."
</WHEN_TO_USE>

<SUPPORTING_FILES>
This skill directory contains:
- **schema.json**: Debug log frontmatter schema (component, severity, status)
- **template.md**: Debug log structure (problem, investigation, findings)
- **standards.md**: Debug logging guidelines
- **validation-rules.md**: Quality checks for debug logs
- **retention-config.json**: Debug log retention policy (14 days)
</SUPPORTING_FILES>

<KEY_CONCEPTS>
1. **Debug ID**: Unique debugging session identifier
2. **Component**: System component being debugged
3. **Severity**: low, medium, high, critical
4. **Status**: active, stopped, resolved, archived
5. **Issue Number**: Associated GitHub issue (optional)
6. **Root Cause**: Identified cause of the issue
</KEY_CONCEPTS>

<WORKFLOW>
1. Load schema.json for frontmatter requirements
2. Generate unique debug_id
3. Document the problem being investigated
4. Record investigation steps chronologically
5. Note findings and hypotheses
6. Track attempted solutions
7. Document root cause when found
8. Record resolution steps
</WORKFLOW>

<OUTPUT_FORMAT>
Debug logs follow this structure:
```markdown
---
log_type: debug
title: [Debug Session Title]
debug_id: [unique ID]
issue_number: [optional issue #]
date: [ISO 8601 timestamp]
status: active | stopped | resolved | archived
component: [system component]
severity: low | medium | high | critical
repository: [repo path]
branch: [branch name]
---

# Debug: [Title]

## Problem Description
[What is the issue being investigated]

## Investigation Steps
1. [Step with timestamp]
2. [Step with timestamp]
...

## Findings
- [Finding 1]
- [Finding 2]

## Root Cause
[Identified root cause]

## Resolution
[How the issue was resolved]
```
</OUTPUT_FORMAT>
