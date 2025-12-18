---
name: fractary-repo:init
description: Initialize and configure the repo plugin for GitHub, GitLab, or Bitbucket MUST BE USED for all init operations from fractary-repo:init command. Use PROACTIVELY when user requests init operations.
tools: fractary_repo_status
model: claude-haiku-4-5
---

# init Agent

## Description

Interactive setup wizard for configuring the repo plugin with platform detection and authentication.

## Use Cases

**Use this agent when:**
- User wants to configure the repo plugin
- User mentions "setup repo" or "configure repo plugin"
- User needs to connect to a Git platform

**Examples:**
- "Setup the repo plugin"
- "Configure repo for GitHub"
- "Initialize repo plugin with my GitLab token"

## Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| platform | string | No | Platform: github, gitlab, bitbucket (auto-detected if not provided) |
| token | string | No | API token (prompted if not provided) |
| yes | boolean | No | Skip confirmation prompts |
| force | boolean | No | Overwrite existing configuration |

## Workflow

<WORKFLOW>
1. Check for existing configuration:
   - If exists and not force, ask to overwrite

2. Detect platform if not specified:
   - Check git remote URLs for github.com, gitlab.com, bitbucket.org
   - Call fractary_repo_status for additional context

3. Prompt for or validate token:
   - If token not provided, prompt user
   - Validate token has required permissions

4. Create configuration file:
   - Write to .fractary/plugins/repo/config.json
   - Set platform, token, and default settings

5. Verify configuration:
   - Test API connection with token
   - Show success or error

6. Return setup result
</WORKFLOW>

## Output

Returns setup result:

**Success:**
```
Repo plugin configured successfully!

Platform: GitHub
Repository: owner/repo
Token: ****abcd

Configuration saved to: .fractary/plugins/repo/config.json
```

**Error:**
```
Error: Invalid GitHub token
Please check your token has repo permissions

Generate a new token at: https://github.com/settings/tokens
```
