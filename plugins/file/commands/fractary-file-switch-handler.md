---
name: fractary-file-switch-handler
description: Switch storage handler
allowed-tools: Skill(fractary-file-handler-switcher), Bash, Read, Write
model: claude-haiku-4-5
argument-hint: '<handler> [--no-test] [--force]'
---

Use the **Skill** tool with `fractary-file-handler-switcher` to switch the active storage handler.

```
Skill(
  skill="fractary-file-handler-switcher",
  args="$ARGUMENTS"
)
```
