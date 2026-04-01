---
name: fractary-core-env-switch
description: Switch to a different environment (test, staging, prod) for credentials from .fractary/env/
allowed-tools: Skill(fractary-core-env-switcher), Bash
model: claude-haiku-4-5
argument-hint: '<environment> [--clear]'
---

Use the **Skill** tool with `fractary-core-env-switcher` to switch environments mid-session.

Essential for **FABER workflows** where you need different credentials for each phase:
- **Evaluate phase**: Switch to test environment
- **Release phase**: Switch to prod environment

```
Skill(
  skill="fractary-core-env-switcher",
  args="$ARGUMENTS"
)
```
