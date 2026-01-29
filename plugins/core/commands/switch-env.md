---
name: fractary-core:switch-env
description: Switch to a different environment (test, staging, prod) for credentials
allowed-tools: Task(fractary-core:switch-env)
model: claude-haiku-4-5
argument-hint: '<environment> | --list | --show | --clear'
---

Use **Task** tool with `fractary-core:switch-env` agent to switch environments mid-session.

Essential for **FABR workflows** where you need different credentials for each phase:
- **Evaluate phase**: Switch to test environment
- **Release phase**: Switch to prod environment

```
Task(
  subagent_type="fractary-core:switch-env",
  description="Switch environment",
  prompt="Switch environment: $ARGUMENTS"
)
```

## Usage Examples

```bash
# Switch to test environment (evaluate phase)
/fractary-core:switch-env test

# Switch to production (release phase)
/fractary-core:switch-env prod

# List available environments
/fractary-core:switch-env --list

# Show current environment status
/fractary-core:switch-env --show

# Clear credentials before switching (clean slate)
/fractary-core:switch-env --clear prod
```

## How It Works

1. Sets `FRACTARY_ENV` to the specified environment
2. Reloads credentials from: `.env` → `.env.{env}` → `.env.local`
3. All subsequent commands use the new environment's credentials

## Environment Files

```
project/
├── .env              # Development (default)
├── .env.test         # Test environment
├── .env.staging      # Staging environment
├── .env.prod         # Production environment
└── .env.local        # Local overrides (always loaded last)
```
