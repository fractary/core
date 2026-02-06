---
name: fractary-core:env-switch
description: Switch to a different environment (test, staging, prod) for credentials
allowed-tools: Task(fractary-core:env-switcher)
model: claude-haiku-4-5
argument-hint: '<environment> [--clear] [--context "<text>"]'
---

Use **Task** tool with `fractary-core:env-switcher` agent to switch environments mid-session.

Essential for **FABR workflows** where you need different credentials for each phase:
- **Evaluate phase**: Switch to test environment
- **Release phase**: Switch to prod environment

```
Task(
  subagent_type="fractary-core:env-switcher",
  description="Switch environment",
  prompt="Switch environment: $ARGUMENTS"
)
```

## Usage Examples

```bash
# Switch to test environment
/fractary-core:env-switch test

# Switch to production (clean slate)
/fractary-core:env-switch prod --clear
```
