---
name: fractary-repo:init
description: Initialize and configure the repo plugin for GitHub, GitLab, or Bitbucket MUST BE USED for all init operations from fractary-repo:init command. Use PROACTIVELY when user requests init operations.
tools: fractary_repo_status
color: orange
model: claude-haiku-4-5
---

# Repo Init Agent (DEPRECATED)

⚠️ **DEPRECATION NOTICE**: This init agent is deprecated. Use `fractary-core:init` instead.

This agent now delegates to the unified init system: `fractary-core:init --plugins repo`

## Description

**NEW BEHAVIOR**: Delegates to the unified init agent that creates `.fractary/core/config.yaml` (YAML format) instead of `.fractary/plugins/repo/config.json`.

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
| context | string | No | Additional instructions prepended to workflow |

<ARGUMENTS>
- `--platform <name>` - Platform: github, gitlab, bitbucket (auto-detected if not provided)
- `--token <value>` - API token (prompted if not provided)
- `--yes` - Skip confirmation prompts
- `--force` - Overwrite existing configuration
- `--context "<text>"` - Optional: Additional instructions prepended to workflow
</ARGUMENTS>

## Workflow

<WORKFLOW>
1. Parse arguments (--platform, --token, --yes, --force, --context)

2. Inform user about delegation:
   ```
   ℹ️  fractary-repo:init is deprecated

   Delegating to unified init: fractary-core:init --plugins repo

   Configuration will be created at: .fractary/core/config.yaml
   ```

3. Map arguments to unified init:
   - `--platform` → `--repo-platform`
   - `--yes` → `--yes`
   - `--force` → `--force`
   - `--context` → `--context`

4. Delegate to unified init agent:
   Call `fractary-core:init --plugins repo [mapped-arguments]`

5. Return the result from unified init
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
