### Packages requiring npm publish

| Directory Pattern | Package | Action |
|---|---|---|
| `sdk/js/**` | `@fractary/core` | `cd sdk/js && npm publish` |
| `cli/**` | `@fractary/core-cli` | `cd cli && npm publish` |
| `mcp/server/**` | `@fractary/core-mcp` | `cd mcp/server && npm publish` |

### Plugins requiring sync/update

| Directory Pattern | Plugin | Action |
|---|---|---|
| `plugins/core/**` | fractary-core | `/Fractary-Core-Configure` |
| `plugins/repo/**` | fractary-repo | Reinstall plugin or restart Claude Code |
| `plugins/work/**` | fractary-work | Reinstall plugin or restart Claude Code |
| `plugins/file/**` | fractary-file | Reinstall plugin or restart Claude Code |
| `plugins/logs/**` | fractary-logs | Reinstall plugin or restart Claude Code |
| `plugins/docs/**` | fractary-docs | Reinstall plugin or restart Claude Code |
| `plugins/status/**` | fractary-status | `/Fractary-Status-Sync` |
