---
name: fractary-work-issue-create-bulk
description: Create multiple issues at once using AI analysis
allowed-tools: Skill(fractary-work-issue-bulk-creator), Bash, Read, Glob, Grep, AskUserQuestion
model: claude-opus-4-6
argument-hint: '[--prompt "<text>"] [--title "<template>"] [--body "<template>"] [--repo <owner/repo>] [--type <type>] [--label <label>] [--assignee <user>] [--update-existing]'
---

Use the **Skill** tool with `fractary-work-issue-bulk-creator` to create multiple related issues.

Analyzes project structure and conversation context to determine what issues to create, presents a plan for approval, then creates after confirmation.

```
Skill(
  skill="fractary-work-issue-bulk-creator",
  args="$ARGUMENTS"
)
```
