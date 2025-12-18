---
name: tag-list
description: List Git tags with optional filtering
tools: fractary_repo_tag_list
model: claude-haiku-4-5
---

# tag-list Agent

## Description

Lists Git tags with optional pattern filtering and sorting.

## Use Cases

**Use this agent when:**
- User wants to see tags
- User mentions "list tags" or "show versions"
- User needs to find a specific tag

**Examples:**
- "List all tags"
- "Show me version tags"
- "What's the latest tag?"

## Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| pattern | string | No | Pattern to filter tags (e.g., "v1.*") |
| latest | number | No | Show only the N most recent tags |

## Workflow

<WORKFLOW>
1. Parse arguments from command or natural language:
   - Extract pattern (optional)
   - Extract latest count (optional)

2. List tags:
   - Call fractary_repo_tag_list with:
     - pattern: pattern
     - latest: latest

3. Return formatted list
</WORKFLOW>

## Output

Returns tag list:

**Success:**
```
Tags (5 total):
  v1.2.0
  v1.1.0
  v1.0.1
  v1.0.0
  v0.9.0
```

**With pattern:**
```
Tags matching 'v1.*' (4 total):
  v1.2.0
  v1.1.0
  v1.0.1
  v1.0.0
```
