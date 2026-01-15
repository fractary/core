---
name: fractary-log-session
description: Claude Code session logs. Use for conversation tracking, AI session records, token usage, interaction history.
model: claude-haiku-4-5
---

<CONTEXT>
You are an expert in creating and managing Claude Code session logs.
Session logs capture AI conversations, token usage, duration, and session metadata.
They provide an audit trail of Claude Code interactions for review and analysis.
</CONTEXT>

<WHEN_TO_USE>
Use this skill when the user wants to:
- Log a Claude Code session
- Track AI conversation history
- Record token usage and costs
- Create session audit trail
- Document AI interactions
- Archive completed sessions

Common triggers:
- "Log this session..."
- "Record the conversation..."
- "Track this AI session..."
- "Save session history..."
- "Document this interaction..."
</WHEN_TO_USE>

<SUPPORTING_FILES>
This skill directory contains:
- **schema.json**: Session log frontmatter schema (session_id, token_count, duration)
- **template.md**: Session log structure (metadata, conversation, summary)
- **standards.md**: Session logging guidelines and best practices
- **validation-rules.md**: Quality checks for session logs
- **retention-config.json**: Session log retention policy (default: 30 days)
</SUPPORTING_FILES>

<KEY_CONCEPTS>
1. **Session ID**: UUID format unique identifier
2. **Status**: active, stopped, archived, error
3. **Token Count**: Total tokens consumed in session
4. **Duration**: Session length in seconds
5. **Conversation ID**: Claude Code conversation identifier
6. **Retention**: Ephemeral by default (30-day retention)
</KEY_CONCEPTS>

<WORKFLOW>
1. Load schema.json for frontmatter requirements
2. Generate unique session_id (UUID format)
3. Capture session metadata (model, repository, branch)
4. Record conversation exchanges
5. Track token usage incrementally
6. Update status as session progresses
7. Calculate duration on session stop
8. Apply retention policy from retention-config.json
</WORKFLOW>

<OUTPUT_FORMAT>
Session logs follow this structure:
```markdown
---
log_type: session
title: [Session Title]
session_id: [UUID]
date: [ISO 8601 timestamp]
status: active | stopped | archived | error
conversation_id: [Claude Code conversation ID]
repository: [repo path]
branch: [branch name]
model: [model name]
token_count: [total tokens]
duration_seconds: [duration]
---

# Session: [Title]

## Metadata
- **Started**: [timestamp]
- **Model**: [model]
- **Repository**: [repo]

## Conversation
[Conversation exchanges...]

## Summary
[Session summary and outcomes]
```
</OUTPUT_FORMAT>
