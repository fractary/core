# Claude Code Plugins

Claude Code plugins providing commands and skills for software development workflows.

## Available Plugins

| Plugin | Commands | Skills | Description |
|--------|----------|--------|-------------|
| `fractary-core` | 11 | 4 | Configuration and environment management |
| `fractary-work` | 8 | 2 | Work item tracking |
| `fractary-repo` | 15 | 1 | Repository operations |
| `fractary-logs` | 15 | 3 | Log management |
| `fractary-file` | 13 | 1 | Multi-provider file storage |
| `fractary-docs` | 14 | 4 | Documentation management |

## Installation

Fractary Core plugins are installed by configuring your `.claude/settings.json` with two things:

### 1. Register the Marketplace

Add the Fractary Core marketplace to `extraKnownMarketplaces` so Claude Code knows where to find the plugins:

```json
{
  "extraKnownMarketplaces": {
    "fractary-core": {
      "source": {
        "source": "github",
        "repo": "fractary/core"
      }
    }
  }
}
```

### 2. Enable Plugins

Enable individual plugins in `enabledPlugins`. Each key follows the format `plugin-name@marketplace-name`:

```json
{
  "enabledPlugins": {
    "fractary-core@fractary-core": true,
    "fractary-repo@fractary-core": true,
    "fractary-work@fractary-core": true,
    "fractary-docs@fractary-core": true,
    "fractary-logs@fractary-core": true,
    "fractary-file@fractary-core": true
  }
}
```

You can enable all plugins or just the ones you need. The `fractary-core` plugin is recommended as a baseline since it manages shared configuration.

### 3. Configure

All plugins read configuration from `.fractary/config.yaml`. After enabling, initialize with:

```
/fractary-core-config-init
```

## Commands vs Skills

**Commands** are direct actions you invoke with `/plugin-command` (e.g., `/fractary-repo-commit`). They execute a specific operation and return results. Commands either execute directly via the CLI or delegate to a skill for orchestration.

**Skills** are lazy-loaded orchestration units that Claude triggers based on conversation context. They handle complex, multi-step workflows and make decisions about how to accomplish a goal. Skills are triggered either:
- Explicitly via a command that delegates to them (e.g., `/fractary-repo-pr-review` delegates to `fractary-repo-pr-reviewer` skill)
- Proactively when Claude detects matching trigger phrases in your conversation

Skills use progressive document loading — only the slim SKILL.md is loaded initially, with supporting documents in `docs/` loaded on-demand via Read().

## Core Plugin (fractary-core)

The core plugin manages shared configuration and environment switching for all other plugins.

### Commands

| Command | Description |
|---------|-------------|
| `/fractary-core-config-init` | Initialize `.fractary/config.yaml` |
| `/fractary-core-config-update` | Update configuration incrementally |
| `/fractary-core-config-validate` | Validate configuration |
| `/fractary-core-config-show` | Display configuration (redacted) |
| `/fractary-core-env-init` | Initialize environment configuration |
| `/fractary-core-env-switch` | Switch environment (test, staging, prod) |
| `/fractary-core-env-list` | List available environments |
| `/fractary-core-env-show` | Show current environment status |
| `/fractary-core-env-section-read` | Read environment config section |
| `/fractary-core-env-section-write` | Write environment config section |
| `/fractary-core-cloud-init` | Initialize cloud configuration |

### Skills

| Skill | Triggers | Description |
|-------|----------|-------------|
| `fractary-core-config-initializer` | "setup fractary", "initialize project" | Fresh setup with auto-detection |
| `fractary-core-config-updater` | "change config", "switch to jira" | Incremental config updates via natural language |
| `fractary-core-env-switcher` | "switch to prod", "use test environment" | Switch environment credentials |
| `fractary-core-cloud-initializer` | "setup cloud", "initialize cloud" | Cloud storage configuration |

## Feature References

For detailed command and skill documentation per toolset, see the feature docs:

- **[Work Tracking](../features/work.md)** - `/fractary-work-*` commands and skills
- **[Repository Management](../features/repo.md)** - `/fractary-repo-*` commands and skills
- **[File Storage](../features/file.md)** - `/fractary-file-*` commands and skills
- **[Log Management](../features/logs.md)** - `/fractary-logs-*` commands and skills
- **[Documentation](../features/docs.md)** - `/fractary-docs-*` commands and skills

## Other Interfaces

- **CLI:** [Command Reference](./cli.md) - Same operations via command line
- **SDK:** [API Reference](./sdk.md) - Programmatic TypeScript access
- **MCP:** [Tool Reference](./mcp.md) - AI agent integration via Model Context Protocol
