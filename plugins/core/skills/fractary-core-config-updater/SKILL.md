---
name: fractary-core-config-updater
description: Incrementally update existing Fractary Core configuration — interprets natural language and applies targeted changes to .fractary/config.yaml
---

# Config Updater

Applies targeted changes to existing `.fractary/config.yaml` based on natural language descriptions. Only modifies sections relevant to the requested change — all other sections (including codex, faber) are preserved exactly.

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--context "<text>"` | Yes | Natural language description of desired changes |
| `--plugins <list>` | No | Comma-separated plugins to modify (inferred from context if omitted) |
| `--dry-run` | No | Preview changes without applying |
| `--yes` | No | Skip confirmation prompts |

## Critical Rules
1. ALWAYS read existing config first via `fractary-core config show`
2. ONLY modify sections relevant to the requested change
3. PRESERVE all unrelated sections exactly as they are
4. NEVER create `codex` or `faber` sections — those are managed by their own plugins
5. ALWAYS present proposed changes BEFORE applying and get confirmation (unless --yes)
6. ALWAYS validate after writing via `fractary-core config validate`
7. NEVER store tokens directly in config — use `${ENV_VAR}` syntax

## Workflow

### Step 1: Read Current Configuration
```bash
fractary-core config show
```
Also read the raw YAML to understand current structure.

### Step 2: Interpret --context
Parse the natural language to identify changes:
- "switch to jira" → Change `work.active_handler` to `jira`, add jira handler config
- "enable S3 storage" → Update `file` section to use S3
- "change repo to gitlab" → Update `repo.active_handler` to `gitlab`

If ambiguous, ask the user to clarify.

### Step 3: Generate Change Preview
Show which sections will be modified vs preserved, with before/after values.

### Step 4: Confirm with User (unless --yes)

### Step 5: Apply Changes
Edit only the specific sections in `.fractary/config.yaml`.

### Step 6: Validate
```bash
fractary-core config validate
```

### Step 7: Report what was changed and next steps.

## Managed Sections
Can modify: work, repo, logs, file, docs, version
NEVER create or modify: codex, faber, faber-cloud
