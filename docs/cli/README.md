# Fractary Core CLI

Command-line interface for all Fractary Core toolsets.

## Installation

```bash
npm install -g @fractary/core-cli
```

## Command Structure

```bash
fractary-core <toolset> <resource> <action> [options]
```

### Examples

```bash
# Work toolset
fractary-core work issue fetch 123
fractary-core work issue create "Bug: Login fails" --type bug
fractary-core work comment add 123 "Investigation complete"

# Repo toolset
fractary-core repo branch create feature/my-feature
fractary-core repo commit --message "Add feature" --type feat
fractary-core repo pr create --title "Feature PR"

# Spec toolset
fractary-core spec create --title "API Design"
fractary-core spec validate SPEC-20240101

# Logs toolset
fractary-core logs search --query "error"
fractary-core logs capture start --issue 123

# File toolset
fractary-core file write data.json --content '{"key":"value"}'
fractary-core file list --pattern "*.json"

# Docs toolset
fractary-core docs create guide-001 --title "User Guide"
fractary-core docs search --query "authentication"
```

## Global Options

| Option | Description |
|--------|-------------|
| `--config <path>` | Path to configuration file |
| `--provider <name>` | Override default provider |
| `--format <type>` | Output format: `json`, `table`, `text` |
| `--verbose` | Enable verbose output |
| `--quiet` | Suppress non-essential output |
| `--help` | Show help for command |
| `--version` | Show version |

## Configuration

The CLI reads configuration from `.fractary/config.yaml` by default.

```bash
# Use default config
fractary-core work issue list

# Use specific config file
fractary-core --config .fractary/staging.yaml work issue list

# Override with command-line flags
fractary-core work issue fetch 123 \
  --provider github \
  --owner myorg \
  --repo myrepo
```

See the [Configuration Guide](/docs/configuration/README.md) for complete options.

## Toolset Command Groups

| Toolset | Command Group | Documentation |
|---------|---------------|---------------|
| **Work** | `fractary-core work` | [Work Commands](/docs/cli/work.md) |
| **Repo** | `fractary-core repo` | [Repo Commands](/docs/cli/repo.md) |
| **Spec** | `fractary-core spec` | [Spec Commands](/docs/cli/spec.md) |
| **Logs** | `fractary-core logs` | [Logs Commands](/docs/cli/logs.md) |
| **File** | `fractary-core file` | [File Commands](/docs/cli/file.md) |
| **Docs** | `fractary-core docs` | [Docs Commands](/docs/cli/docs.md) |

## Output Formats

### JSON Output

```bash
fractary-core work issue fetch 123 --format json
```

```json
{
  "number": 123,
  "title": "Bug: Login fails",
  "state": "open",
  "labels": ["bug", "priority:high"]
}
```

### Table Output

```bash
fractary-core work issue list --format table
```

```
NUMBER  TITLE                   STATE   LABELS
123     Bug: Login fails        open    bug, priority:high
124     Add user dashboard      open    enhancement
125     Update dependencies     closed  chore
```

### Text Output

```bash
fractary-core work issue fetch 123 --format text
```

```
Issue #123: Bug: Login fails
State: open
Labels: bug, priority:high
```

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | General error |
| `2` | Configuration error |
| `3` | Authentication error |
| `4` | Resource not found |
| `5` | Validation error |

## Environment Variables

The CLI respects these environment variables:

```bash
# Provider credentials
export GITHUB_TOKEN=ghp_your_token
export JIRA_TOKEN=your_jira_token
export LINEAR_API_KEY=your_linear_key

# Default settings
export FRACTARY_CONFIG=.fractary/config.yaml
export FRACTARY_FORMAT=json
export FRACTARY_VERBOSE=true
```

## Examples

### Work Tracking Workflow

```bash
# Create an issue
fractary-core work issue create "Implement authentication" \
  --type feature \
  --labels "enhancement,priority:high"

# Add a comment
fractary-core work comment add 123 "Starting implementation"

# Update issue state
fractary-core work issue update 123 --state closed

# Search issues
fractary-core work issue search "authentication" --state open
```

### Repository Workflow

```bash
# Create a feature branch
fractary-core repo branch create feature/auth --base main

# Stage and commit
fractary-core repo commit --message "Add auth middleware" --type feat

# Create a pull request
fractary-core repo pr create \
  --title "Add authentication system" \
  --base main

# Merge the PR
fractary-core repo pr merge 42 --method squash
```

### Specification Workflow

```bash
# Create a new spec
fractary-core spec create --title "API Design" --type api

# Validate a spec
fractary-core spec validate SPEC-20240101

# List all specs
fractary-core spec list --type feature
```

## Other Interfaces

- **SDK:** [API Reference](/docs/sdk/README.md)
- **MCP:** [Tool Reference](/docs/mcp/README.md)
- **Plugins:** [Plugin Reference](/docs/plugins/README.md)
