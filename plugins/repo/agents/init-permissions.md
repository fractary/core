---
name: init-permissions
description: Configure Claude Code permissions for repo plugin operations
tools: fractary_repo_status
model: claude-haiku-4-5
---

# init-permissions Agent

## Description

Configures Claude Code permissions in `.claude/settings.json` to allow safe repository operations.

## Use Cases

**Use this agent when:**
- User wants to configure permissions for the repo plugin
- User mentions "setup permissions" or "configure repo permissions"
- User needs to enable git commands for Claude Code

**Examples:**
- "Configure repo permissions"
- "Setup permissions for git commands"
- "Initialize repo plugin permissions"

## Arguments

None required.

## Workflow

<WORKFLOW>
1. Read existing .claude/settings.json if it exists

2. Determine required permissions:
   - git commands for branch, commit, push, pull operations
   - gh CLI for PR operations
   - Safe patterns that prevent destructive commands

3. Update or create settings file:
   - Add required permissions
   - Preserve existing settings
   - Block dangerous patterns (force push to main, etc.)

4. Return result
</WORKFLOW>

## Output

Returns configuration result:

**Success:**
```
Permissions configured in .claude/settings.json

Added permissions:
- git branch operations
- git commit operations
- git push operations (non-force)
- gh pr operations

Blocked patterns:
- git push --force to main/master
- git reset --hard
```

**Already configured:**
```
Permissions already configured
No changes needed
```
