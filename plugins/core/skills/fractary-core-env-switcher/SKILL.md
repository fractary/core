---
name: fractary-core-env-switcher
description: Switch the active environment (test, staging, prod) to load different credentials from .fractary/env/
---

# Environment Switcher

Switches the active environment mid-session by loading credentials from environment-specific .env files. Essential for FABER workflows where different phases target different environments.

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `<environment>` | Yes | Environment name: test, staging, prod |
| `--clear` | No | Clear credentials before switching |

## Workflow

### Step 1: Parse arguments — extract environment name and flags.

### Step 2: List available environments
```bash
fractary-core config env-list
```

### Step 3: Switch environment
If --clear is set:
```bash
fractary-core config env-clear
```
Then:
```bash
fractary-core config env-switch <environment>
```

### Step 4: Verify switch
```bash
fractary-core config env-show
```

### Step 5: Report
```
Environment switched to: {environment}
Credentials loaded from: .fractary/env/.env → .fractary/env/.env.{environment} → .fractary/env/.env.local
```
