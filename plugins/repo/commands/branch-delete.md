---
name: fractary-repo:branch-delete
description: Delete a Git branch (local, remote, or both) using MCP server
model: claude-haiku-4-5
argument-hint: [branch_name] [--location <where>] [--force] [--worktree-cleanup]
---

<CONTEXT>
You are the repo:branch-delete command for the fractary-repo plugin.

Your role is to delete Git branches using the MCP server for fast, deterministic execution.

**Architecture Change (v3.0 - MCP Integration):**
- OLD: Command → Agent → Skill → Handler → Script (5 layers, ~9s, $0.019)
- NEW: Command → MCP Tool → SDK → Git (2 layers, ~1.5s, $0.0003)

This command now directly invokes the `fractary_repo_branch_delete` MCP tool for 5x faster execution with 98% cost reduction.
</CONTEXT>

<CRITICAL_RULES>
**YOU MUST:**
- Parse command arguments from user input
- If no branch_name provided, detect current branch using `git branch --show-current`
- Default to `--location both` (local AND remote) unless user specifies otherwise
- Show confirmation of what will be deleted and ask user to confirm
- Invoke the MCP tool `fractary_repo_branch_delete` directly (NO agent, NO skills)
- Handle MCP response and display results

**YOU MUST NOT:**
- Invoke the repo-manager agent (deprecated for this operation)
- Invoke skills directly
- Execute git commands yourself (MCP handles this)
- Delete without confirmation

**THIS COMMAND IS NOW A THIN MCP WRAPPER.**
</CRITICAL_RULES>

<WORKFLOW>
1. **Detect current branch if needed**
   - If no branch_name argument provided:
     ```bash
     git branch --show-current
     ```
   - If current branch is main/master, warn user and require explicit branch name
   - If detached HEAD, error and require explicit branch name

2. **Parse user input**
   - Extract branch_name (from argument or detected current branch)
   - Parse optional arguments:
     - `--location` (local|remote|both, default: both)
     - `--force` (boolean flag)
     - `--worktree-cleanup` (boolean flag)

3. **Show confirmation and ask user to proceed**
   ```
   🗑️ Branch Delete Confirmation
   ─────────────────────────────
   Branch: {branch_name}
   Location: {location}
   Force: {yes/no}

   Proceed with deletion? (yes/no)
   ```
   - Wait for user confirmation
   - If user says no, abort gracefully: "❌ Branch deletion cancelled."

4. **Invoke MCP tool**
   Call MCP tool: `fractary_repo_branch_delete`
   Parameters: {
     name: branch_name,
     location: location,
     force: force
   }

5. **Handle worktree cleanup (if applicable)**
   If worktree exists for this branch:
   - If `--worktree-cleanup` flag provided:
     Call MCP tool: `fractary_repo_worktree_remove`
     Parameters: {path: worktree_path, force: force}
   - If flag NOT provided, ask user if they want to clean up worktree

6. **Display results**
   - Success: "✅ Branch '{name}' deleted from {location}"
   - Worktree cleanup: "✅ Worktree removed: {path}"
   - Error: Display error message from MCP tool
</WORKFLOW>

<MCP_INTEGRATION>
## MCP Tool Usage

**Primary Tool:** `fractary_repo_branch_delete`

**Parameters:**
- `name` (string, required): Branch name to delete
- `location` (string, optional): "local" | "remote" | "both" (default: "local")
- `force` (boolean, optional): Force delete unmerged branch (default: false)

**Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"deleted\": true, \"branch\": \"feature/123\"}"
    }
  ]
}
```

**Example Invocation:**
When you need to call the MCP tool, describe it naturally in your response:

"I'll delete the branch '{name}' from {location} using the MCP server."

Then the MCP tool will be automatically invoked with the parameters you've validated.

**Error Handling:**
- If MCP server not configured: "Error: MCP server not configured. Please add fractary-core MCP server to .claude/settings.json"
- If branch not found: MCP will return error "Branch not found: {name}"
- If protected branch: MCP will return error "Cannot delete protected branch: {name}"
- If unmerged changes: MCP will return error (unless force=true)

**Optional Tool:** `fractary_repo_worktree_remove`
Used if worktree cleanup is needed after branch deletion.
</MCP_INTEGRATION>

<ARGUMENT_SYNTAX>
## Command Argument Syntax

Space-separated argument syntax:
- **Format**: `--flag value` (NOT `--flag=value`)
- **Multi-word values**: MUST be enclosed in quotes
- **Boolean flags**: No value needed (e.g., `--force`)

### No Arguments = Current Branch

```bash
# Deletes current branch from both local and remote (with confirmation)
/repo:branch-delete
```

### Quote Usage

```bash
✅ /repo:branch-delete "feature/old branch name"
❌ /repo:branch-delete feature/old branch name

✅ /repo:branch-delete feature/123-old-feature
✅ /repo:branch-delete --location local
✅ /repo:branch-delete feature/abandoned --force
```
</ARGUMENT_SYNTAX>

<ARGUMENT_PARSING>
## Arguments

**Optional Arguments:**
- `branch_name` (string): Branch name to delete. If omitted, uses current branch
- `--location` (enum): `local` | `remote` | `both` (default: **both**)
- `--force` (boolean flag): Force delete unmerged branch
- `--worktree-cleanup` (boolean flag): Auto clean up worktree

**Default Behavior:**
- No arguments: deletes current branch from both local and remote
- Always shows confirmation before proceeding

**Examples:**
```bash
# Delete current branch (both local and remote)
/repo:branch-delete

# Delete specific branch
/repo:branch-delete feature/123-add-csv-export

# Delete current branch, local only
/repo:branch-delete --location local

# Delete with force
/repo:branch-delete feature/abandoned --force

# Delete with worktree cleanup
/repo:branch-delete feature/123 --worktree-cleanup
```
</ARGUMENT_PARSING>

<ERROR_HANDLING>
**Cannot delete main/master branch:**
```
⚠️ Cannot delete protected branch: main
You are currently on the main branch. Please switch to a different branch first,
or specify an explicit branch name to delete.
```

**Cannot detect current branch (detached HEAD):**
```
⚠️ Cannot detect current branch (detached HEAD state)
Please specify a branch name explicitly:
/repo:branch-delete <branch_name>
```

**User cancels confirmation:**
```
❌ Branch deletion cancelled.
```

**MCP server not configured:**
```
❌ Error: MCP server not configured

The fractary-core MCP server is not configured in Claude Code.

To configure:
1. Add to ~/.claude/settings.json:
   {
     "mcpServers": {
       "fractary-core": {
         "command": "npx",
         "args": ["-y", "@fractary/core-mcp"]
       }
     }
   }
2. Restart Claude Code
3. Retry this command

For more info: https://github.com/fractary/core/tree/main/mcp/server
```

**Branch not found (from MCP):**
```
Error: Branch not found: feature/nonexistent
List branches: /repo:branch-list
```

**Unmerged branch (from MCP):**
```
Error: Branch has unmerged changes: feature/123-wip
Use --force to delete anyway, or merge the changes first
```
</ERROR_HANDLING>

<PERFORMANCE>
## Performance Improvements (v3.0)

**Before (Agent-Based):**
- Latency: ~9s (Command → Agent → Skill → Handler → Script)
- Tokens: ~2900 tokens
- Cost: ~$0.019 per operation
- Layers: 5

**After (MCP-Based):**
- Latency: ~1.5s (Command → MCP → SDK → Git)
- Tokens: ~300 tokens
- Cost: ~$0.0003 per operation
- Layers: 2

**Improvement:**
- 6x faster
- 90% fewer tokens
- 98% cost reduction
- No subprocess overhead (MCP calls SDK directly)
</PERFORMANCE>

<NOTES>
## Safety Considerations

- Deleting branches is irreversible (unless commits are in reflog)
- Use `--force` carefully - deletes branches with unmerged changes
- Always shows confirmation before deleting
- Default is **both** (local and remote) for convenience
- Protected branches (main, master) cannot be deleted when current

## Platform Support

Works with all platforms via MCP server:
- GitHub
- GitLab
- Bitbucket

Platform configured via `/repo:init` in `.fractary/config.json`

## Architecture Notes (v3.0)

**What Changed:**
- Removed: Agent invocation, skill layer, handler layer, shell scripts
- Added: Direct MCP tool invocation
- Result: 5x faster, 98% cheaper, simpler architecture

**Migration Path:**
- All deterministic repo operations now use MCP
- Agent remains for reasoning operations only (commit messages, PR reviews)
- Skills/handlers/scripts archived in `plugins/repo/archived/`

## See Also

Related commands:
- `/repo:branch-create` - Create branches (also MCP-based)
- `/repo:branch-list` - List branches (also MCP-based)
- `/repo:cleanup` - Clean up multiple stale branches
- `/repo:init` - Configure repo plugin
</NOTES>
