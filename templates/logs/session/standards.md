# Session Log Standards

## Required Conventions

### 1. Identification
- ALWAYS generate UUID format session_id
- ALWAYS include start timestamp
- ALWAYS link to conversation_id when available

### 2. Metadata Tracking
- ALWAYS record model name
- ALWAYS track token count
- ALWAYS calculate duration on session stop

### 3. Status Management
- ALWAYS start sessions as active
- ALWAYS mark stopped when capture ends
- ALWAYS mark error if session fails

### 4. Content Capture
- ALWAYS capture conversation exchanges
- ALWAYS include tool calls and results
- ALWAYS summarize session outcomes

## Best Practices

- Use UUID format: `{uuid}` for session_id
- Redact sensitive information (API keys, passwords)
- Include repository and branch context
- Link sessions to work items when applicable
- Summarize key decisions made during session
- Note follow-up actions identified
- Archive sessions after 7 days locally
- Keep cloud copies for historical reference
