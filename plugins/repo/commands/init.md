---
name: fractary-repo:init
description: Repository Plugin Setup Wizard
model: claude-haiku-4-5
argument-hint: '[--platform <name>] [--token <value>] [--yes] [--force]'
---

Initialize and configure the repo plugin for GitHub, GitLab, or Bitbucket.

Invokes the **init** agent to run the interactive setup wizard.

**Usage:**
```
/fractary-repo:init
/fractary-repo:init --platform github
/fractary-repo:init --force
```
